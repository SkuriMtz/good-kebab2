# Brief para constructores (Inspector A)

**Qué sirve.** De `visual.md` solo §1 (hero de partículas). Todo lo de Vercel/Geist/GitHub/"apps de chat" (visual.md §2–5) y `tecnica.md` §5 (Geist) está obsoleto: letra Inter (`lib/fonts.ts`), aspecto de `docs/referencias/`. `textos.md` ya está revisado contra spec §2: se usa tal cual; botones y barra en minúsculas normales (el CSS los pone en MAYÚSCULAS en oscuro). Si `lib/agents.ts` (`line`, `never`) difiere de textos.md §3, gana textos.md. **[E]** = estimación, medir en dispositivo (en el sandbox no hay navegador).
**Dueños: manda `docs/plan.md`.** C2 lleva también `supabase/`, `middleware.ts`, `/auth`, `/salir`, `/api/lista`, `/api/contacto`; C3 solo chat y `/api/chat`.

## Para todos
- Un solo `primary` por pantalla; "Entrar" de la barra siempre `secondary`. Párrafos 18px/200 en oscuro: usar blanco (no gris) en textos largos de celular [E: el 200 se ve fino].
- Transiciones (tecnica.md §1; ya están en `globals.css`, `page-transitions.tsx`, `theme-script.tsx`): nombrar solo `site-header`, `app-top`, `app-side`, `site-bg`; nunca un contenedor de página. `Link` de `next-view-transitions` solo con `href` string; `#ancla`, `mailto:` y externos con `<a>`. Ruta lenta = pantalla vieja congelada: `loading.tsx` en `/panel` y `/chat`; sitio y `/pruebalo` estáticos.
- Revelado (tecnica.md §3): `data-r` nunca en botones ni enlaces (pisa su `transition`); envuélvelos. Falta en `reveal.tsx`: tras navegar, si el bloque ya está en pantalla, `is-in no-anim` (+ `.no-anim [data-r]{transition:none}`), si no se anima dos veces junto a `vt-in`.
- Contrastes calculados: blanco/violeta 4.6 · blanco/azul 4.7 · #b64400/blanco 5.5 · slate #707070/#f5f5f7 4.55 (límite: no aclarar) · ash #9a9a9a/negro 7.5. Foco: anillo 2px con separación del color del botón principal.
- Sin probar y que solo se confirma en dispositivo: iOS (atrás por gesto, portada larga a DPR 3), Safari con "reducir movimiento". iOS ≤17 y Firefox <144 no ven la transición (sin error).

## Constructor 1 · Landing (+ /contacto, UI de /entrar, 404)
- Textos: textos.md §1 barra, §2 portada, §3 agentes, §4 para quién, §5 demo, §6 precios, §7 posibles preguntas (ancla `#preguntas`), §8 lista/contacto/entrar/404/pie.
- Título de portada en `heading-lg` (clamp 40→78px), no en `display` 113px: son 41 caracteres y en media columna salen ~5 líneas [E]. Claro: 80px/1.05 (40px en celular). Un solo `h1`.
- Hero: 2 columnas asimétricas (texto izq., figura der.); en celular la figura va debajo del texto, canvas cuadrado `min(100% − 32px, 360px)`. Escritorio 600×600. Canvas nunca sobre la columna de texto (spec §7).
- Scroll del hero: visual.md §1 "Mapa de scroll" (240 svh escritorio / 200 svh celular, escenario `sticky` 100svh; 0–.20 burbuja, .20–.75 morph, .75–1 cuatro círculos). Hacia .75 el texto cruza por opacidad (misma celda) a textos.md §3 ("Tu equipo de agentes" + subtítulo) y esa sección sigue con las 4 fichas.
- **Figura en Canvas 2D.** Valen de visual.md §1: geometría de "Figura 2" (burbuja con 3 puntos huecos, 2×2 círculos con ojos huecos), "Muestreo de formas" y la fórmula de "Interpolación". Obsoleto: WebGL2/GLSL, colores por agente, giro, cantidades.
  - Muestreo: canvas fuera de pantalla 384²/256², `Path2D`, huecos con `destination-out`, `getImageData` una vez, rejilla con jitter, `mulberry32`, emparejar A↔B por (ángulo, radio). Guardar todo en `Float32Array`; cero objetos por cuadro.
  - Movimiento: `t=clamp((p−d·.35)/.65)`, `e=t²(3−2t)`, `pos=mix(A,B,e)+S·4e(1−e)·spread` (spread .55; .40 en celular). Orientación de cada triángulo fija (offsets precalculados); sin giro en el viaje (spec §3.5).
  - Agrupar trazos: el color es FIJO por partícula y mezclado al azar con semilla (si se interpola color no se puede agrupar). 5 colores × 3 niveles de alfa = 15 grupos; por cuadro, un `beginPath` y un `stroke()` por grupo. `lineWidth` 1 (1.25 con DPR ≥ 2); sin relleno, `shadowBlur` ni `globalCompositeOperation`.
  - Oscuro: #8052ff #ffb829 #1fb89a #ff5a8a #4d7dff, alfa .45/.65/.85 (tope .85). Claro: #7d5cf2 #f2a20c #15846e #e8396c #0071e3 (`agent.hex.light`), alfa .45/.5/.6.
  - Cantidad (Canvas 2D aguanta menos que el WebGL de visual.md): 3 000 en 1440 · 2 200 en 768 · 1 400 en 390 [E]; triángulo 4–6px (3.5–5px celular). Adaptativa: promedio de 30 cuadros > 20 ms → ×0.7, piso 800, nunca sube; arrancar al 70% con `hardwareConcurrency ≤ 4` o `deviceMemory ≤ 4`. Plan B si un Android medio no baja de 20 ms: atlas de sprites (5 colores × 12 orientaciones) con `drawImage`.
  - Presupuesto: DPR tope 2 (1.75 celular). Hay loop solo mientras `|s−uP| > 0.0005` (`uP += (s−uP)·.12`); deriva de reposo solo en escritorio a 30 fps. `IntersectionObserver` (rootMargin 200px) y `visibilitychange` pausan. No hay contextos WebGL.
  - Carga ≤ 1.2s: ensamblado 900ms ease-out + opacidad del canvas 600ms; `dynamic(..., { ssr:false })` tras el primer rAF (no toca el LCP). Reducir movimiento: un cuadro con p=0, sin loop; "tu equipo" estático con `progress={1}`. Canvas `aria-hidden`.
- Fondo `particle-field.tsx` (existe, solo oscuro): hoy hace loop continuo con deriva en todos los dispositivos. Dejarlo en un dibujo al montar/redimensionar (o 30 fps sin deriva en celular); alfa ≤ .35; ya se oculta en claro.
- Base a ajustar (los hace C1 y lo reporta): `smooth-scroll.tsx` (tecnica.md §2) sin `stopInertiaOnNavigate: true`, con scrollTo/refresh también en el primer render, sin restaurar `lagSmoothing(500,33)` en `stop()`, y el mq sin `(hover: hover)`. Cerrar menú o ficha antes de navegar (`lockScroll(false)`).
- Demo (textos.md §5): guion local en un arreglo, sin llamar a nada. Los 10 mensajes salen escalonados una sola vez al entrar a la sección (≤ 400ms entre ellos); con reducir movimiento aparecen todos. Sugerencias solo tras el mensaje 10; "$450" y horarios con su nota "de ejemplo".
- Formulario de lista (textos.md §2 "Estados", §8): un componente para portada y lista final, contrato `/api/lista` (spec §4), `role="status"`, `Button state="loading"`. One y Max (secondary) bajan a la lista con el plan preseleccionado. Sin cifras de mensajes en el sitio.

## Constructor 2 · Panel y Pruébalo (+ sesión, migraciones, /api/lista, /api/contacto)
- Datos: textos.md §9 tal cual (8 actividades, 5 conversaciones, 2 grupos, 6 comandos, vacío, aviso). "Datos de ejemplo" visible solo en `/pruebalo`. Estado de la fila: `listo` / `espera` / `aviso` (types.ts); "Aprobado por Ana" es `listo` con detalle.
- Aspecto (spec §3.4): oscuro sin cajas, líneas ni fondos; selección por color y peso, no por relleno; única excepción el 7% blanco (`bg-field`). Claro: lateral y bandas #f5f5f7, tarjetas blancas 28px. Estados como texto plano: oscuro etiqueta mayúsculas (aviso en #ffb829), claro `.t-status` #b64400. El color del agente vive solo en su blob.
- El plan se muestra en solo lectura, sin ninguna interfaz para cambiarlo; el uso viene de `plan_limits`.
- Sesión (tecnica.md §4): matcher `["/panel/:path*","/chat/:path*"]`; `getClaims()`, nunca `getSession()`; copiar las cabeceras del 2º argumento de `setAll`; sin variables → `/entrar?error=no_configurado`. El `(app)/layout.tsx` (`getUser()` + redirect) lo crea el inspector B.
- Callback: acepta `token_hash`+`type` (`verifyOtp`) y `code`; `next` solo si empieza con `/` y no con `//`; fallo → `/entrar?error=enlace` (textos.md §8). Plantilla "Magic Link" con `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next=/panel` (PKCE falla si abren el correo en otro navegador o visor del celular). Site URL y Redirect URLs con localhost y producción. Límite: 1 enlace por 60s, vence en 1h: "Reenviar el enlace" desactivado 60s.
- Migración (tecnica.md §6): `revoke insert, update on profiles from anon, authenticated` y `grant update (nombre, negocio, equipo)`: `equipo` falta en la lista de tecnica.md y el usuario sí lo edita (types.ts). Trigger `security definer` + `search_path=''` crea el perfil; `proteger_plan` como cinturón. Probar con `set role authenticated`.
- Spec §5 no trae `SUPABASE_SERVICE_ROLE_KEY`: no hay `service_role` en la app. El plan se cambia a mano en Supabase; no agregues esa clave sin avisar.
- `waitlist` y `contact_messages`: solo INSERT público. Índice único en `lower(email)`; insertar sin `.select()`; `yaEstaba` = error 23505. Validar en servidor (`correo_invalido`, `campos`); sin variables → 503 `no_configurado`.

## Constructor 3 · Chat y `/api/chat`
- Guion de `/pruebalo/chat`: textos.md §5 (10 mensajes, tarjetas de cita y aviso, 3 sugerencias) + §9 "Textos de apoyo" y comandos. "Cita del jueves" abre ese guion. Copiarlo, no importarlo de `components/landing`. Sin IA ni Supabase.
- Aspecto (spec §3.4, §7): oscuro = mensaje del agente como texto flotando junto a su blob, sin burbuja ni caja; píldora solo para el mensaje del usuario y la caja de escribir (7% blanco, radio 24, sin borde). Claro = usuario en píldora #f5f5f7, caja blanca con borde #86868b y radio 980.
- Un solo `primary`: "Aprobar y enviar" de una tarjeta pendiente (`ResultCard.accion`); el enviar del compositor, ícono `ghost`. "Escribiendo…": texto y 3 puntos que solo cambian opacidad, `aria-live="polite"`. Menú "/" sin cajas en oscuro; ↑ ↓ Enter Esc.
- Celular: compositor fijo abajo con `env(safe-area-inset-bottom)` y alto `100dvh`, no `100vh` (teclado de iOS) [probar].
- `/api/chat` (contrato spec §4), orden: 401 sin sesión → 503 sin variables → 403 `agente_no_incluido` (plan) → 402 `limite` (mensajes `rol='usuario'` del mes vs `plan_limits`) → streaming de texto. Clave solo `process.env`, nunca `NEXT_PUBLIC_`; modelo de `ATENDEL_AI_MODEL`.
- El system prompt de cada agente (español de México, de tú) debe hacer cumplir su "Nunca sin tu permiso" (textos.md §3) y avisar cuando un caso necesita a una persona; sin horarios ni precios en los datos, Lola dice que no lo sabe y avisa (como el mensaje 10 de la demo). Son compromisos de copy (textos.md §10).
- textos.md no trae mensajes del chat real para 401, 402 ni 503: escríbelos con las reglas de spec §2 y repórtalos.

## Riesgos abiertos
1. Rendimiento de la figura en Android medio (Canvas 2D, 1 400 partículas): medir primero; plan B es el atlas.
2. Los nombres `site-bg`/`site-header` en la transición no se vieron en pantalla; confirmar que `/pruebalo` ↔ sitio no parpadea (el `:only-child` ya cubre una pieza ausente).
3. Enlace mágico por PKCE en el celular; sin la plantilla `token_hash` fallará.
