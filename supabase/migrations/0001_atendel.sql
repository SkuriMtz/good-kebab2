-- =====================================================================
-- Atendel · migración 0001
-- Tablas EXACTAS de lib/db/types.ts (profiles, plan_limits, grupos,
-- conversations, messages, uso_mensual, actividad, waitlist, contact_messages).
--
-- Se puede correr más de una vez sin romper nada (usa "if not exists",
-- "drop ... if exists" y "on conflict do nothing").
--
-- Reglas de seguridad:
--   * Cada persona ve y cambia SOLO lo suyo (RLS en todas las tablas).
--   * Nadie puede cambiar su propio `plan` desde la app: solo se cambia a
--     mano desde Supabase (ver supabase/README.md).
--   * El uso del mes (uso_mensual) lo suma un trigger; la app solo lo lee. Así
--     borrar conversaciones no devuelve mensajes al límite.
--   * waitlist y contact_messages: cualquiera puede escribir, nadie puede leer
--     desde la app (los correos solo se ven en el panel de Supabase).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. profiles · una fila por persona (la crea un trigger al registrarse)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  nombre     text check (nombre is null or char_length(nombre) <= 120),
  negocio    text check (negocio is null or char_length(negocio) <= 160),
  plan       text not null default 'free' check (plan in ('free', 'one', 'max')),
  equipo     text[] not null default '{}'
             check (equipo <@ array['lola', 'clara', 'victor', 'iris']::text[]),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: ver lo propio" on public.profiles;
create policy "profiles: ver lo propio" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists "profiles: editar lo propio" on public.profiles;
create policy "profiles: editar lo propio" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- RLS filtra filas, no columnas. Por eso se quitan los permisos de tabla y se
-- dan solo por columna: nombre, negocio y equipo sí; `plan` nunca.
-- (Si algún día se agrega otra columna editable, hay que darle su propio grant.)
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (nombre, negocio, equipo) on public.profiles to authenticated;

-- Cinturón extra: aunque alguien le diera permisos de tabla por error, el
-- trigger frena cualquier cambio de `plan` que venga de la app.
create or replace function public.proteger_plan()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.plan is distinct from old.plan
     and current_user in ('anon', 'authenticated') then
    raise exception 'plan: solo se cambia desde Supabase, no desde la app'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists proteger_plan on public.profiles;
create trigger proteger_plan
  before update on public.profiles
  for each row execute function public.proteger_plan();

-- Crea el perfil al registrarse. Corre con permisos del dueño de la función
-- (security definer) porque la persona no puede insertar en profiles.
create or replace function public.crear_perfil_al_registrarse()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nombre)
  values (
    new.id,
    left(nullif(btrim(coalesce(new.raw_user_meta_data ->> 'nombre', '')), ''), 120)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.crear_perfil_al_registrarse() from public, anon, authenticated;

drop trigger if exists crear_perfil_al_registrarse on auth.users;
create trigger crear_perfil_al_registrarse
  after insert on auth.users
  for each row execute function public.crear_perfil_al_registrarse();

-- Personas que ya existían antes de esta migración.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- 2. plan_limits · mensajes al mes por plan (solo lectura para la app)
-- ---------------------------------------------------------------------
create table if not exists public.plan_limits (
  plan          text primary key check (plan in ('free', 'one', 'max')),
  mensajes_mes  integer not null check (mensajes_mes >= 0)
);

alter table public.plan_limits enable row level security;

drop policy if exists "plan_limits: ver" on public.plan_limits;
create policy "plan_limits: ver" on public.plan_limits
  for select to authenticated
  using (true);

revoke all on public.plan_limits from anon, authenticated;
grant select on public.plan_limits to authenticated;

-- VALORES PROVISIONALES: el DUEÑO define cuántos mensajes al mes tiene cada
-- plan. Se cambian con, por ejemplo:
--   update public.plan_limits set mensajes_mes = 100 where plan = 'free';
-- Correr esta migración otra vez NO pisa los valores que ya hayas cambiado.
insert into public.plan_limits (plan, mensajes_mes) values
  ('free', 30),
  ('one', 300),
  ('max', 500)
on conflict (plan) do nothing;

-- ---------------------------------------------------------------------
-- 3. grupos · agentes que colaboran y se pasan el trabajo
-- ---------------------------------------------------------------------
create table if not exists public.grupos (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nombre     text not null check (char_length(btrim(nombre)) between 1 and 80),
  agentes    text[] not null default '{}'
             check (agentes <@ array['lola', 'clara', 'victor', 'iris']::text[]
                    and cardinality(agentes) between 1 and 4),
  created_at timestamptz not null default now()
);

create index if not exists grupos_user_id_idx on public.grupos (user_id);

alter table public.grupos enable row level security;

drop policy if exists "grupos: ver lo propio" on public.grupos;
create policy "grupos: ver lo propio" on public.grupos
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "grupos: crear lo propio" on public.grupos;
create policy "grupos: crear lo propio" on public.grupos
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "grupos: editar lo propio" on public.grupos;
create policy "grupos: editar lo propio" on public.grupos
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "grupos: borrar lo propio" on public.grupos;
create policy "grupos: borrar lo propio" on public.grupos
  for delete to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.grupos from anon, authenticated;
grant select, insert, update, delete on public.grupos to authenticated;

-- ---------------------------------------------------------------------
-- 4. conversations · una por chat (con un agente o con un grupo)
-- ---------------------------------------------------------------------
create table if not exists public.conversations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titulo     text not null default 'Conversación nueva'
             check (char_length(titulo) between 1 and 160),
  tipo       text not null default 'agente' check (tipo in ('agente', 'grupo')),
  agentes    text[] not null default '{}'
             check (agentes <@ array['lola', 'clara', 'victor', 'iris']::text[]),
  grupo_id   uuid references public.grupos (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversations_user_updated_idx
  on public.conversations (user_id, updated_at desc);
create index if not exists conversations_grupo_id_idx
  on public.conversations (grupo_id);

alter table public.conversations enable row level security;

drop policy if exists "conversations: ver lo propio" on public.conversations;
create policy "conversations: ver lo propio" on public.conversations
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Si trae un grupo, ese grupo tiene que ser de la misma persona.
drop policy if exists "conversations: crear lo propio" on public.conversations;
create policy "conversations: crear lo propio" on public.conversations
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (
      grupo_id is null
      or exists (
        select 1 from public.grupos g
        where g.id = grupo_id and g.user_id = (select auth.uid())
      )
    )
  );

drop policy if exists "conversations: editar lo propio" on public.conversations;
create policy "conversations: editar lo propio" on public.conversations
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (
      grupo_id is null
      or exists (
        select 1 from public.grupos g
        where g.id = grupo_id and g.user_id = (select auth.uid())
      )
    )
  );

drop policy if exists "conversations: borrar lo propio" on public.conversations;
create policy "conversations: borrar lo propio" on public.conversations
  for delete to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.conversations from anon, authenticated;
grant select, insert, update, delete on public.conversations to authenticated;

-- ---------------------------------------------------------------------
-- 5. messages · rol = 'usuario' cuenta para el límite del mes (vía uso_mensual)
-- ---------------------------------------------------------------------
create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  rol             text not null check (rol in ('usuario', 'agente', 'sistema')),
  agente          text check (agente is null or agente in ('lola', 'clara', 'victor', 'iris')),
  contenido       text not null check (char_length(contenido) <= 20000),
  tarjeta         jsonb check (
                    tarjeta is null
                    or (
                      jsonb_typeof(tarjeta) = 'object'
                      and tarjeta ->> 'tipo' in ('cita', 'correo', 'archivo', 'aviso')
                      and char_length(coalesce(tarjeta ->> 'titulo', '')) > 0
                    )
                  ),
  created_at      timestamptz not null default now()
);

create index if not exists messages_conversation_created_idx
  on public.messages (conversation_id, created_at);
create index if not exists messages_user_id_idx
  on public.messages (user_id);

alter table public.messages enable row level security;

drop policy if exists "messages: ver lo propio" on public.messages;
create policy "messages: ver lo propio" on public.messages
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Solo se puede escribir en una conversación propia.
drop policy if exists "messages: crear lo propio" on public.messages;
create policy "messages: crear lo propio" on public.messages
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = (select auth.uid())
    )
  );

-- Sin update ni delete directos: los mensajes no se editan (así nadie cambia
-- el `rol` de un mensaje viejo para librar el límite). Se borran junto con su
-- conversación (on delete cascade).
revoke all on public.messages from anon, authenticated;
grant select, insert on public.messages to authenticated;

-- Al llegar un mensaje, la conversación sube en la lista.
create or replace function public.tocar_conversacion()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.conversations
     set updated_at = now()
   where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists tocar_conversacion on public.messages;
create trigger tocar_conversacion
  after insert on public.messages
  for each row execute function public.tocar_conversacion();

-- ---------------------------------------------------------------------
-- 5b. uso_mensual · mensajes que escribió cada persona en cada mes
--     Un trigger suma 1 por cada mensaje con rol = 'usuario'. Como el
--     contador vive aparte, borrar una conversación NO baja el uso del mes.
--     La app solo lee su propia fila; nadie escribe aquí desde el cliente.
-- ---------------------------------------------------------------------
create table if not exists public.uso_mensual (
  user_id  uuid not null references auth.users (id) on delete cascade,
  mes      date not null check (extract(day from mes) = 1), -- siempre el día 1 del mes (UTC)
  mensajes integer not null default 0 check (mensajes >= 0),
  primary key (user_id, mes)
);

alter table public.uso_mensual enable row level security;

drop policy if exists "uso_mensual: ver lo propio" on public.uso_mensual;
create policy "uso_mensual: ver lo propio" on public.uso_mensual
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Solo lectura: sin policies de insert, update ni delete y sin permisos de tabla.
revoke all on public.uso_mensual from anon, authenticated;
grant select on public.uso_mensual to authenticated;

-- Suma 1 al mes del mensaje (mes en UTC). Corre con permisos del dueño de la
-- función (security definer) porque la persona no puede escribir en uso_mensual.
create or replace function public.sumar_uso_mensual()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.rol = 'usuario' then
    insert into public.uso_mensual (user_id, mes, mensajes)
    values (new.user_id, date_trunc('month', new.created_at at time zone 'utc')::date, 1)
    on conflict (user_id, mes)
      do update set mensajes = public.uso_mensual.mensajes + 1;
  end if;
  return new;
end;
$$;

revoke execute on function public.sumar_uso_mensual() from public, anon, authenticated;

drop trigger if exists sumar_uso_mensual on public.messages;
create trigger sumar_uso_mensual
  after insert on public.messages
  for each row when (new.rol = 'usuario')
  execute function public.sumar_uso_mensual();

-- Mensajes que ya existían antes de esta migración. Si la fila del mes ya
-- existe (porque el trigger ya la lleva), no se toca.
insert into public.uso_mensual (user_id, mes, mensajes)
select user_id, date_trunc('month', created_at at time zone 'utc')::date, count(*)
from public.messages
where rol = 'usuario'
group by 1, 2
on conflict (user_id, mes) do nothing;

-- ---------------------------------------------------------------------
-- 6. actividad · lo que hicieron los agentes (para el panel)
-- ---------------------------------------------------------------------
create table if not exists public.actividad (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  agente     text not null check (agente in ('lola', 'clara', 'victor', 'iris')),
  accion     text not null check (char_length(accion) between 1 and 300),
  estado     text not null default 'listo' check (estado in ('listo', 'espera', 'aviso')),
  detalle    text check (detalle is null or char_length(detalle) <= 1000),
  created_at timestamptz not null default now()
);

create index if not exists actividad_user_created_idx
  on public.actividad (user_id, created_at desc);

alter table public.actividad enable row level security;

drop policy if exists "actividad: ver lo propio" on public.actividad;
create policy "actividad: ver lo propio" on public.actividad
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "actividad: crear lo propio" on public.actividad;
create policy "actividad: crear lo propio" on public.actividad
  for insert to authenticated
  with check (user_id = (select auth.uid()));

-- Solo se puede cambiar el estado y el detalle (por ejemplo, al dar el visto bueno).
drop policy if exists "actividad: editar lo propio" on public.actividad;
create policy "actividad: editar lo propio" on public.actividad
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

revoke all on public.actividad from anon, authenticated;
grant select, insert on public.actividad to authenticated;
grant update (estado, detalle) on public.actividad to authenticated;

-- ---------------------------------------------------------------------
-- 7. waitlist · lista de espera (solo inserción pública, sin lectura)
-- ---------------------------------------------------------------------
create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null check (char_length(email) between 3 and 254),
  plan       text check (plan is null or plan in ('free', 'one', 'max')),
  origen     text check (origen is null or char_length(origen) <= 60),
  created_at timestamptz not null default now()
);

-- Un correo, una sola vez (sin importar mayúsculas).
create unique index if not exists waitlist_email_unico on public.waitlist (lower(email));

alter table public.waitlist enable row level security;

drop policy if exists "waitlist: cualquiera se anota" on public.waitlist;
create policy "waitlist: cualquiera se anota" on public.waitlist
  for insert to anon, authenticated
  with check (true);

revoke all on public.waitlist from anon, authenticated;
grant insert on public.waitlist to anon, authenticated;

-- ---------------------------------------------------------------------
-- 8. contact_messages · formulario de contacto (solo inserción pública)
-- ---------------------------------------------------------------------
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null check (char_length(btrim(nombre)) between 1 and 120),
  email      text not null check (char_length(email) between 3 and 254),
  mensaje    text not null check (char_length(btrim(mensaje)) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_idx
  on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

drop policy if exists "contact_messages: cualquiera escribe" on public.contact_messages;
create policy "contact_messages: cualquiera escribe" on public.contact_messages
  for insert to anon, authenticated
  with check (true);

revoke all on public.contact_messages from anon, authenticated;
grant insert on public.contact_messages to anon, authenticated;
