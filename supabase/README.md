# Base de datos de Atendel (Supabase)

Aquí vive todo lo que Supabase necesita: las tablas, quién puede ver qué y los números de cada plan.

## 1. Aplicar la migración

La migración es `migrations/0001_atendel.sql`. Se puede correr más de una vez sin problema: no borra datos ni pisa los límites que ya hayas cambiado.

**Opción A: desde el navegador (la más sencilla)**

1. Entra a tu proyecto en [supabase.com](https://supabase.com) y abre **SQL Editor**.
2. Pulsa **New query**.
3. Copia todo el contenido de `migrations/0001_atendel.sql`, pégalo y pulsa **Run**.
4. Debe decir "Success". Revisa en **Table Editor** que aparezcan: `profiles`, `plan_limits`, `grupos`, `conversations`, `messages`, `actividad`, `waitlist` y `contact_messages`.

**Opción B: con la línea de comandos**

```bash
supabase link --project-ref TU_REFERENCIA
supabase db push
```

## 2. Conectar la app

1. En **Project Settings → API** copia la URL del proyecto y la clave `anon` (pública).
2. Ponlas en `.env.local` (copia `.env.example`):
   `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Reinicia el servidor. Esas variables se incrustan al compilar: si las agregas después, hay que volver a compilar.

La app **no usa** la clave `service_role` y no debe usarla nunca. No la pegues en el código ni en `.env.local`.

## 3. Configurar el enlace de entrada

En **Authentication → URL Configuration**:

- **Site URL**: la dirección real del sitio (por ejemplo `https://atendel.mx`).
- **Redirect URLs**: agrega `http://localhost:3000/auth/callback` y la de producción (`https://TU-SITIO/auth/callback`).

En **Authentication → Email Templates → Magic Link**, cambia el enlace por este (así funciona aunque abran el correo en otro navegador o en el visor del celular):

```html
<h2>Entra a Atendel</h2>
<p><a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next=/panel">Entrar</a></p>
```

Supabase manda 1 enlace por minuto a cada correo y cada enlace vence en 1 hora.

## 4. Cambiar el plan de una persona (a mano)

Nadie puede cambiar su propio plan desde la app: la base de datos se lo impide. Solo se cambia desde Supabase, así:

1. Abre **SQL Editor** y corre (cambia el correo y el plan: `free`, `one` o `max`):

   ```sql
   update public.profiles
      set plan = 'max'
    where id = (select id from auth.users where email = 'persona@correo.com');
   ```

2. También se puede hacer en **Table Editor → profiles**: busca la fila, edita la columna `plan` y guarda.

Al recargar el panel, la persona ya ve su plan nuevo.

**Equipo en Max.** La columna `equipo` guarda qué agentes eligió la persona (`lola`, `clara`, `victor`, `iris`). Si está vacía en un plan Max, la app le da los cuatro. La persona sí puede cambiar su `equipo`, su `nombre` y su `negocio`.

## 5. Cambiar los mensajes al mes de cada plan

Los números que trae la migración son **provisionales**: el dueño define los definitivos. Para cambiarlos:

```sql
update public.plan_limits set mensajes_mes = 50  where plan = 'free';
update public.plan_limits set mensajes_mes = 400 where plan = 'one';
update public.plan_limits set mensajes_mes = 800 where plan = 'max';
```

La app cuenta los mensajes que escribe la persona en el mes (`messages` con `rol = 'usuario'`) y los compara con este número.

## 6. Ver la lista de espera y los mensajes de contacto

Desde la app nadie puede leer estas tablas (solo escribir). Tú las ves en **Table Editor → `waitlist`** y **`contact_messages`**. En la lista de espera cada correo entra una sola vez, sin importar las mayúsculas.

## 7. Qué protege cada tabla

| Tabla | Quién la ve | Quién escribe |
|---|---|---|
| `profiles` | cada persona, solo la suya | la propia persona, solo `nombre`, `negocio` y `equipo` (el perfil se crea solo al registrarse) |
| `plan_limits` | cualquier persona con sesión | nadie desde la app |
| `grupos`, `conversations`, `actividad` | cada persona, solo lo suyo | la propia persona (en `actividad` solo puede cambiar `estado` y `detalle`) |
| `messages` | cada persona, solo los suyos | la propia persona, solo en conversaciones suyas; no se editan |
| `waitlist`, `contact_messages` | nadie desde la app | cualquiera puede agregar un registro |

## 8. Pendiente que decide el dueño

El uso del mes se calcula contando los mensajes guardados. Si una persona borra una conversación, sus mensajes se borran y el conteo baja. Si eso importa, hay dos caminos: no dejar borrar conversaciones (solo archivarlas) o guardar un contador aparte. No se hizo todavía porque cambiaría las tablas del contrato de datos.
