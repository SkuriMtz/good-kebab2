# Investigación técnica (Grupo A)
Verificado leyendo el código de los paquetes (`npm pack` + `node_modules`), docs oficiales y probando el SQL en un Postgres 16 desechable. `last30days` se intentó una vez: devolvió ruido sin relación (HN/Steam; GitHub y web bloqueados); descartado. No hay navegador en el sandbox: lo marcado **[probar]** no se vio en pantalla.
Versiones: `geist` 1.8.0 no existe en npm (primera 1.8.x = 1.8.1; instalada 1.8.2) · `lenis` 1.3.27 · `@supabase/ssr` 0.12.7 exige `supabase-js ^2.108` (hay 2.118.0).

## 1. next-view-transitions 0.3.5 + Next 14.2

Código leído (`dist/index.js`, 60 líneas útiles). `ViewTransitions` va **fuera de `<html>`**. `Link` solo intercepta si `'startViewTransition' in document`, respeta ctrl/cmd/shift/alt y `target`, y llama `router.push/replace(as||href, {scroll:true})`. `useTransitionRouter` solo envuelve `push`/`replace` (acepta `onTransitionReady`); back/forward los toma un listener `popstate` propio. `use()` sale del React que Next trae para App Router (confirmado en `next/dist/compiled/react`).
```tsx
<ViewTransitions><html lang="es-MX">…<body>{children}</body></html></ViewTransitions>
import { Link, useTransitionRouter } from "next-view-transitions";
<Link href="/contacto">Contacto</Link>;  const router = useTransitionRouter(); router.push("/entrar");
```
- `href` solo string. Externos, `mailto:`, `tel:` y `#hash` van con `<a>`/`next/link` (si no, `router.push` externo corre dentro de la transición).
- El callback de `startViewTransition` es una promesa que se resuelve en un `useEffect` tras montar la ruta nueva. Ruta lenta = pantalla congelada con la captura vieja. Páginas estáticas; `loading.tsx` en `/panel` y `/chat`.

**Barra y fondo quietos, contenido que sale/entra (spec §3.5).** Patrón recomendado: nombrar solo barra y fondo; el contenido se queda en `root`.
```css
.vt-header { view-transition-name: site-header; }  /* barra */
.vt-bg     { view-transition-name: site-bg; }      /* SOLO el canvas de partículas (transparente) */
::view-transition-group(site-header), ::view-transition-group(site-bg) { animation: none; }
::view-transition-old(site-header), ::view-transition-old(site-bg)   { display: none; }
::view-transition-new(site-header), ::view-transition-new(site-bg)   { animation: none; } /* sin esto el UA hace fundido 0→1 y parpadea */
::view-transition-old(root), ::view-transition-new(root) { mix-blend-mode: normal; }      /* por defecto plus-lighter: suma y aclara */
::view-transition-old(root) { animation: vt-out 200ms cubic-bezier(.4,0,1,1) both; }
::view-transition-new(root) { animation: vt-in 520ms cubic-bezier(.16,1,.3,1) 60ms both; }
@keyframes vt-out { to { opacity: 0; transform: translateY(-16px); } }
@keyframes vt-in  { from { opacity: 0; transform: translateY(40px); } }
```
- Por qué `root` y no un `.vt-page` que envuelva todo: la captura de `root` mide solo el viewport (sale desde donde estaba la persona, sin compensar scroll); un elemento nombrado de toda la página es una textura de miles de px (en móvil, DPR 3, puede superar límites de GPU) **[probar en iOS/Android con la landing larga]**. Además Firefox recorta los `position:fixed` hijos de un elemento nombrado (bug 1979005) y el nombre crea contexto de apilamiento.
- Efecto residual: los nombrados se pintan encima de `root` (CSSWG #8941), así que las partículas (≤0.35) pasan tenues sobre el texto ~0.5 s. El elemento nombrado del fondo debe ser transparente: el color de página va en `html/body` (también evita destellos en los huecos).
- Un nombre = una sola pieza a la vez. Si una página no la tiene (`/panel` sin barra del sitio), `old{display:none}` la corta; la base lo resuelve con `:only-child`.

**Reducir movimiento.** La librería no trae opción. Quitar la API antes de hidratar es lo más limpio (todo cae a navegación normal; el CSS `animation:none` solo deja la transición “instantánea” pero igual congela y captura):
```js
// en ThemeScript (head)
if (matchMedia("(prefers-reduced-motion: reduce)").matches) delete Document.prototype.startViewTransition;
```
Mantén también `@media (prefers-reduced-motion: reduce){ ::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){animation:none!important} }`. Código propio (cambio de tema): `document.startViewTransition?.(…)`. **[probar en Safari]**

**Soporte (mismo documento):** Chrome/Edge 111+ (Android incluido), Safari/iOS 18+, Firefox 144+ (oct 2025, “Baseline newly available”). Sin soporte: sin error, navegación normal sin animación (`Link` no hace `preventDefault`; `push` llama directo). iOS ≤17 y Firefox <144 no verán el efecto.
**iOS, deslizar para volver:** Safari ya anima el gesto y la librería lanza otra transición en `popstate` (doble animación, CSSWG “Double Transition”). Mitigación **[sin probar]**: marcar la causa y anular en CSS.
```js
addEventListener("popstate", () => { document.documentElement.dataset.nav = "pop"; });          // registrado antes que el de la librería
addEventListener("click", () => { delete document.documentElement.dataset.nav; }, true);
```
```css
:root[data-nav="pop"]::view-transition-old(root), :root[data-nav="pop"]::view-transition-new(root) { animation: none; }
```

## 2. Lenis 1.3 + GSAP ScrollTrigger (App Router)

Integración del README de Lenis (verificada). Sin `scrollerProxy`: Lenis mueve el `window` y ScrollTrigger lo lee nativo.
```tsx
const tick = (t: number) => lenis?.raf(t * 1000);       // a nivel módulo: hace falta la misma referencia para remove()
function start() { lenis = new Lenis({ stopInertiaOnNavigate: true }); lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0); }  // autoRaf es false por defecto: manda el ticker de GSAP
function stop()  { gsap.ticker.remove(tick); lenis?.destroy(); lenis = null; gsap.ticker.lagSmoothing(500, 33); }
const mq = matchMedia("(pointer: fine) and (hover: hover) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)");
// useEffect([]): sync = () => mq.matches ? (!lenis && start()) : (lenis && stop()); sync(); mq.addEventListener("change", sync); cleanup: remove + stop()
// useEffect([pathname]): if (!primeraVez) { lenis ? lenis.scrollTo(0, { immediate: true, force: true }) : scrollTo(0, 0); requestAnimationFrame(() => ScrollTrigger.refresh()); }
```
- Reinicio explícito: Next solo hace `scrollTop = 0` si la parte de arriba de la página nueva queda fuera de pantalla (`layout-router.js`), y `onNativeScroll` de Lenis ignora scrolls nativos mientras `isScrolling === "smooth"`; la inercia puede arrastrar la página nueva. `stopInertiaOnNavigate` (1.3.27) corta la inercia al clic en enlace interno.
- Limpieza: `destroy()` quita listeners, clases `lenis*` de `<html>` y cancela el rAF. Por componente: `const ctx = gsap.context(() => ScrollTrigger.create({…}), ref); return () => ctx.revert();` (revierte triggers y estilos al desmontar la ruta vieja).
- Con View Transitions no chocan: Lenis solo cambia `scrollTop`. El efecto de `pathname` (descendiente de `ViewTransitions`) corre antes del `resolve()` de la librería, así que la captura nueva ya sale arriba. Cierra menú/ficha antes de navegar (`lockScroll(false)`).
- Lenis 1.3.27 trae `respectReducedMotion` (true), pero la spec pide cero Lenis: no crear instancia. Base actual (`smooth-scroll.tsx`): casi igual; falta `stopInertiaOnNavigate`, saltar el primer render del efecto de `pathname` (hoy hace `scrollTo(0)`/`refresh()` también al cargar) y restaurar `lagSmoothing` en `stop()`.

## 3. Revelado una sola vez sin riesgo de contenido oculto

CSS decide, JS solo pone una clase; el estado oculto existe solo si hay JS y no hay “reducir movimiento”.
```html
<script>document.documentElement.classList.add("js");setTimeout(()=>{if(!window.__ok)document.documentElement.classList.add("reveal-all")},3000)</script>
```
```css
.js [data-r] { opacity: 0; transform: translate3d(0,24px,0); }
.js .is-in [data-r], .reveal-all [data-r] { opacity: 1; transform: none; transition: opacity 700ms var(--ease-out), transform 800ms var(--ease-out); transition-delay: calc(var(--i,0)*70ms); }
@media (prefers-reduced-motion: reduce) { .js [data-r] { opacity: 1; transform: none; } }
```
`IntersectionObserver` por bloque: al entrar, `classList.add("is-in")` y `disconnect()` (así es “una sola vez”); sin IO, `is-in` de inmediato. Fallos cubiertos: sin JS (nunca existe `.js`), bundle roto (a los 3 s `reveal-all`), reduced-motion, sin IO. La transición vive solo en el estado final. Es lo que ya hay en `globals.css` + `reveal.tsx`; ScrollTrigger no hace falta aquí (solo portada/efectos con `scrub`).
- Doble animación tras navegar: lo que ya está en pantalla se revela mientras corre `vt-in`. En `Reveal`: tras navegación cliente, si el bloque ya está en el viewport, añade `is-in no-anim` (`.no-anim [data-r]{transition:none}`).
- No pongas `data-r` en botones/enlaces: la regla `transition` pisa sus transiciones de color/presión; envuélvelos.

## 4. @supabase/ssr 0.12 + Next 14

`createBrowserClient` y `createServerClient` **lanzan** si falta URL o clave (leído en su código): siempre tras `isSupabaseConfigured()`. `lib/supabase/client.ts` y `server.ts` de la base ya usan `getAll/setAll` como pide la doc (en Next 14 `cookies()` es síncrono). `setAll` recibe un 2.º argumento `headers` (Cache-Control/Expires/Pragma) que el middleware debe copiar a la respuesta. Autorizar con `getClaims()` (docs actuales); nunca `getSession()` en servidor. La 2.ª cadena puede ser la anon o la publishable (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en docs nuevas); el nombre del `.env.example` sirve igual.
```ts
// middleware.ts (Next 14 se llama middleware; en 16 sería proxy)
export const config = { matcher: ["/panel/:path*", "/chat/:path*"] };   // el resto del sitio nunca toca Supabase
export async function middleware(request: NextRequest) {
  const entrar = request.nextUrl.clone(); entrar.pathname = "/entrar"; entrar.search = "";
  if (!isSupabaseConfigured()) { entrar.searchParams.set("error", "no_configurado"); return NextResponse.redirect(entrar); }
  let response = NextResponse.next({ request });
  const sb = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, { cookies: {
    getAll: () => request.cookies.getAll(),
    setAll(list, headers) {
      list.forEach(({ name, value }) => request.cookies.set(name, value));
      response = NextResponse.next({ request });
      list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
    } } });
  const { data } = await sb.auth.getClaims();                     // { data: { claims } | null, error }
  if (data?.claims) return response;
  entrar.searchParams.set("next", request.nextUrl.pathname);
  const redirect = NextResponse.redirect(entrar);
  response.cookies.getAll().forEach((c) => redirect.cookies.set(c));   // conservar cookies y cache headers
  ["cache-control", "expires", "pragma"].forEach((h) => { const v = response.headers.get(h); if (v) redirect.headers.set(h, v); });
  return redirect;
}
```
**Enlace mágico.** Cliente: `getBrowserSupabase()` → si `null`, estado “no configurado”; si no:
```ts
await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/auth/callback?next=/panel`, shouldCreateUser: true } });
```
```ts
// app/auth/callback/route.ts — acepta token_hash (recomendado) y code (PKCE)
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams, code = q.get("code"), token_hash = q.get("token_hash"), type = q.get("type") as EmailOtpType | null;
  const next = q.get("next") ?? "/panel", destino = next.startsWith("/") && !next.startsWith("//") ? next : "/panel";  // sin open redirect
  const sb = getServerSupabase();
  if (!sb) return NextResponse.redirect(`${SITE_URL}/entrar?error=no_configurado`);
  const { error } = token_hash && type ? await sb.auth.verifyOtp({ type, token_hash })
    : code ? await sb.auth.exchangeCodeForSession(code) : { error: new Error("sin_codigo") };
  return NextResponse.redirect(`${SITE_URL}${error ? "/entrar?error=enlace" : destino}`);
}
```
- El flujo por defecto es PKCE: el `code_verifier` queda en una cookie del navegador que pidió el enlace. Si abren el correo en otro navegador o en el visor de una app (común en celular), `exchangeCodeForSession` falla. Solución de la doc: plantilla “Magic Link” con `<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next=/panel">Entrar</a>` y `verifyOtp` (sin cookie). Lo de “escáneres de correo que consumen el enlace” viene de reportes de comunidad.
- Panel de Supabase: Site URL = dominio real; Redirect URLs con `http://localhost:3000/auth/callback` y la de producción. Límites de la doc: 1 enlace por 60 s por usuario, vence en 1 h.
- El middleware no es la única barrera: `(app)/layout.tsx` con `getUser()` + `redirect("/entrar")`, y `/api/chat` responde 401 (contrato).
- Sin variables: build y sitio público funcionan (no se llama a Supabase); `/panel` y `/chat` redirigen a `/entrar?error=no_configurado`; APIs 503 `no_configurado`. Las `NEXT_PUBLIC_*` se incrustan al compilar: si se agregan después, hay que recompilar.

## 5. Paquete `geist` 1.8 con Next 14

```tsx
import { GeistSans } from "geist/font/sans"; import { GeistMono } from "geist/font/mono";
<html className={`${GeistSans.variable} ${GeistMono.variable}`}>   // define --font-geist-sans y --font-geist-mono
// tailwind.config: fontFamily: { sans: ["var(--font-geist-sans)"], mono: ["var(--font-geist-mono)"] }
```
- **Peso 450 sí**: `dist/sans.js` y `mono.js` cargan `Geist-Variable.woff2` / `GeistMono-Variable.woff2` con `weight: "100 900"`. Sirve `font-weight: 450` (Tailwind `font-[450]`), 300 y 400, con un solo archivo.
- Evita `geist/font` (raíz, deprecado, 9 archivos estáticos) y `*-non-variable`. `.variable` solo define la variable (`.className` aplica `font-family`). La base ya está bien.

## 6. RLS: que nadie cambie su `plan`

RLS filtra filas, no columnas, y una política no ve `OLD`. Lo correcto son privilegios por columna (probado en PG 16 simulando `authenticated`/`service_role`):
```sql
revoke insert, update on public.profiles from anon, authenticated;   -- primero el nivel tabla: si no, el permiso de tabla anula el de columna
grant update (nombre, negocio) on public.profiles to authenticated;  -- lista blanca; `plan` queda fuera
```
Resultados: `set plan='max'` como `authenticated` → `permission denied`; `set nombre=…` pasa; `insert … plan='max'` denegado; `service_role` cambia `plan`.
- Crea el perfil con un trigger `security definer` sobre `auth.users` (`set search_path = ''`); el cliente no hace INSERT (si pudiera, se pondría `plan='max'`). Cada columna nueva editable requiere su `grant update (col)`. `select *` no se afecta (solo se restringe UPDATE/INSERT).
- Cambios de plan solo desde servidor con `service_role` (nunca en el cliente); `plan_limits` solo lectura.
- Cinturón adicional, también probado (`SECURITY INVOKER`: con `definer`, `current_user` sería el dueño):
```sql
create function public.proteger_plan() returns trigger language plpgsql set search_path = '' as $$
begin if new.plan is distinct from old.plan and current_user in ('anon','authenticated')
  then raise exception 'plan: solo se cambia desde el servidor' using errcode = '42501'; end if; return new; end $$;
create trigger proteger_plan before update on public.profiles for each row execute function public.proteger_plan();
```

## Riesgos
1. `.vt-page` (nombrar todo el contenido) no se pudo medir; probar en celular real o pasar al patrón `root` de §1.
2. Enlace mágico por PKCE falla en otro navegador/app: usar plantilla con `token_hash`.
3. Safari iOS (atrás por gesto) y “reducir movimiento” solo se confirman en dispositivo real.

## Fuentes
- https://github.com/shuding/next-view-transitions · https://web.dev/blog/web-platform-10-2025 · https://developer.chrome.com/docs/web-platform/view-transitions
- https://www.w3.org/TR/css-view-transitions-1/ · https://lists.w3.org/Archives/Public/public-css-archive/2025Mar/0202.html · https://lists.w3.org/Archives/Public/public-css-archive/2023Jan/0578.html
- https://bugzilla.mozilla.org/show_bug.cgi?id=1979005 · https://community.vercel.com/t/next-js-view-transitions-vs-suspense-caching/26064
- https://github.com/darkroomengineering/lenis (README y `dist` 1.3.27) · `next/dist/client/components/layout-router.js`
- https://supabase.com/docs/guides/auth/server-side/nextjs · https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs · https://supabase.com/docs/guides/auth/server-side/advanced-guide
- https://supabase.com/docs/guides/auth/auth-email-passwordless · https://supabase.com/docs/guides/database/postgres/column-level-security · https://github.com/supabase/ssr
- https://www.npmjs.com/package/geist · https://github.com/vercel/geist-font
