# Guía para constructores (Grupo B)

Lee antes de escribir código: `docs/especificacion.md` (completa), `docs/referencias/oscuro-dala.md`,
`docs/referencias/claro-apple.md`, `docs/investigacion/brief.md` (tu parte) y `docs/investigacion/textos.md` (los textos).
Los textos de `textos.md` se usan tal cual (ya revisados contra las reglas). Si falta un texto, escríbelo con las reglas de la spec §2.

## Lo que ya existe (base) — úsalo, no lo dupliques

| Pieza | Archivo | Uso |
|---|---|---|
| Tokens y clases de tipo | `app/globals.css` | `.t-hero` `.t-display` `.t-title-lg` `.t-title` `.t-h3` `.t-lead` `.t-body` `.t-small` `.t-label` `.t-status` `.t-nav` `.t-num` · `.page-w` (ancho 1280 + márgenes) · `.band` (banda #f5f5f7 en claro, nada en oscuro) · `.card` (sin caja en oscuro; blanca 28px en claro) |
| Colores Tailwind | `tailwind.config.ts` | sitio: `canvas canvas-alt surface ink ink-2 ink-3 line line-strong field field-line brand brand-hover brand-press link accent verdant danger success` · panel: `app-bg app-bar app-card app-field app-hover app-line app-fg app-fg-2` · chat: `chat-bg chat-panel chat-pill chat-card chat-composer chat-hover chat-fg chat-fg-2` · personajes: `agent-lola agent-clara agent-victor agent-iris` |
| Variantes de modo | Tailwind | `light:` y `dark:` (siguen `data-theme` en `<html>`; oscuro por defecto). Ej: `rounded-[24px] light:rounded-[28px]` |
| Radios | Tailwind | `rounded-control` (24px oscuro / píldora claro) · `rounded-field` (24 / 980) · `rounded-card` (24 / 28) |
| Alturas | Tailwind | `h-header` = alto de la barra del sitio (64px oscuro / 48px claro); deja `pt-header` o más arriba del contenido |
| Botones | `components/ui/button.tsx` | `<Button variant="primary\|secondary\|ghost" size="md\|lg" state="idle\|loading\|success" loadingLabel successLabel>` · `<ButtonLink href>` · `buttonClasses()` para enlaces. **Un solo `primary` visible por pantalla.** |
| Campos | `components/ui/field.tsx` | `<FieldShell label hint message status>{({id, describedBy}) => <Input id={id} aria-describedby={describedBy} status/>}</FieldShell>` · `Input` `Textarea` · `isEmail()` |
| Panel modal | `components/ui/sheet.tsx` | `<Sheet open onClose title side="right\|bottom\|auto">` (foco atrapado, Esc, bloqueo de scroll, entrada 500ms / salida 200ms) |
| Íconos | `components/ui/icon.tsx` | `<Icon name="menu\|close\|plus\|bell\|chat\|search\|arrowRight\|arrowLeft\|arrowUp\|check\|sun\|moon\|trash\|chevronDown\|chevronRight\|at\|slash\|home\|activity\|users\|calendar\|mail\|file\|paperclip\|more\|logout\|lock\|edit\|clock\|stop" size>` — si falta uno, agrégalo ahí con el mismo trazo |
| Spinner | `components/ui/spinner.tsx` | estado "enviando" |
| Personajes | `components/brand/agent-blob.tsx` | `<AgentBlob agent="lola" size={48} alive labelled />` |
| Logo | `components/brand/logo.tsx` | `<Logo href>` · `<LogoMark size>` |
| Tema | `components/theme/theme-toggle.tsx`, `use-theme.ts` | `<ThemeToggle withLabel?/>` · `useTheme()` → `{theme, toggle}` |
| Revelado al bajar | `components/motion/reveal.tsx` | `<Reveal as="section">` + `data-r` en cada pieza (se revelan en orden, una vez, 70ms entre piezas; sin JS se ve todo) |
| GSAP | `lib/gsap.ts` | `import { gsap, ScrollTrigger, prefersReducedMotion, EASE_OUT, EASE_IN } from "@/lib/gsap"` (ScrollTrigger ya registrado; Lenis ya lo actualiza) |
| Scroll | `components/motion/smooth-scroll.tsx` | `getLenis()`, `lockScroll(bool)` |
| Agentes y planes | `lib/agents.ts` | `AGENTS`, `getAgent(id)`, `agent.color` (CSS), `agent.hex.dark/light` (canvas), `PLANS`, `agentsForPlan(plan)` |
| Supabase | `lib/supabase/client.ts`, `server.ts`, `lib/env.ts` | `getBrowserSupabase()` / `getServerSupabase()` devuelven `null` si no hay variables de entorno: maneja ese caso (estado "no configurado"), nunca truenes |
| Layout del sitio | `app/(site)/layout.tsx` | barra fija + fondo de partículas + pie. Tus páginas del sitio van dentro de `app/(site)/` |

## Reglas de construcción

- Enlaces internos: `import { Link } from "next-view-transitions"` (hace la transición de página). Anclas `#…`, `mailto:` y externos: `<a>`.
- Nada de colores sueltos (`#…`) en componentes, salvo `agent.hex` en canvas. Todo con tokens.
- Oscuro (Dala): **sin** cajas, bordes, divisores, sombras ni paneles grises. Jerarquía con tamaño, peso y espacio. Única excepción: campos interactivos (`bg-field`, `bg-chat-composer`, `bg-chat-pill`, `bg-app-field`).
- Claro (Apple): bandas `.band` (#f5f5f7) de ancho completo con tarjetas blancas `.card` (28px, sin sombra). Sin gradientes, sin sombras, sin píldoras de color para etiquetas.
- Sin emojis. Sin monoespaciada. Sin fuentes del sistema (ya carga Inter).
- Movimiento: solo opacidad y translate; entradas `ease-out` 600–800ms, salidas 180–240ms; nada de rebotes/giros/escalas. Respeta `prefers-reduced-motion` (todo visible, nada se mueve).
- Estados diseñados en cada control: hover, presión, foco visible, enviando, éxito, error.
- Celular (390px) es su propia composición: sin scroll horizontal, áreas táctiles ≥ 44px, hamburguesa solo ícono.
- Accesibilidad: `aria-label` en botones de solo ícono, `role="status"`/`alert` en mensajes, navegable con teclado.
- **No edites archivos de la base** (tabla de arriba) salvo para agregar algo pequeño que te falte (un ícono, un token). Si lo haces, dilo en tu reporte.
- **Toca solo tus carpetas** (ver `docs/plan.md`). Otro constructor trabaja en paralelo.

## Validar (sin `npm run build`, que lo corre el inspector)

```bash
cd /home/user/good-kebab2
npx tsc --noEmit
npx next lint --dir app --dir components --dir lib
```
El servidor de desarrollo ya corre en http://localhost:3000 (si no responde, NO lo reinicies tú; avisa en tu reporte).
Para ver tu trabajo: `NODE_PATH=$(npm root -g) node /tmp/claude-0/-home-user-good-kebab2/f85b4258-e8fc-5a28-b506-df7fa0ad98d8/scratchpad/look.js <carpeta-salida> <ruta> <dark|light> <1440|390> [full]`
(guarda una captura y dice si hay scroll horizontal). Revisa 1440 y 390, oscuro y claro.
