# Atendel — Plan de implementación

> Para agentes: se ejecuta por grupos (superpowers: dispatching-parallel-agents + subagent-driven-development).
> Cada grupo tiene 3 mini agentes y 1 inspector. Spec: `docs/especificacion.md` (léela completa).

**Meta:** sitio público (landing) + app (panel, Pruébalo y chats) de Atendel, listos para desplegar.

**Arquitectura:** Next.js 14 App Router. Tokens de color en variables CSS (`data-theme` en `<html>`), mapeados a Tailwind v3.
Grupos de rutas: `app/(site)` (landing con barra y fondo de partículas), `app/pruebalo` (demo), `app/(app)` (requiere sesión).
Supabase para sesión (enlace mágico), lista de espera, contacto, conversaciones y actividad. IA solo en `/api/chat` (servidor).

**Stack:** next 14.2.35 · react 18 · typescript · tailwindcss 3.4 · Inter (@fontsource-variable/inter) · gsap 3 · lenis 1.3 · next-view-transitions 0.3 · @supabase/ssr · @anthropic-ai/sdk.

**Aspecto:** oscuro = `docs/referencias/oscuro-dala.md`, claro = `docs/referencias/claro-apple.md` (decisión del dueño). Guía de la base: `docs/constructores.md`.

## Restricciones globales

- Spec §2 (reglas que nunca se rompen) aplica a cada línea de texto.
- Solo tokens: nada de colores sueltos en componentes salvo los de los agentes (vienen de `lib/agents.ts`).
- Componentes base en `components/ui`, `components/brand`, `components/motion` — se usan, no se duplican. Si falta algo, se agrega ahí con cuidado de no romper a otros.
- Cada constructor toca solo sus carpetas (tabla de propiedad abajo).
- No correr `npm run build` en paralelo con otro agente: los constructores validan con `npx tsc --noEmit` y `npx next lint --file <archivos>`. El inspector corre el build completo.

## Grupos

### Grupo A — Investigación (antes de construir)
1. Investigador visual → `docs/investigacion/visual.md`
2. Investigador técnico → `docs/investigacion/tecnica.md`
3. Investigador de lenguaje y textos → `docs/investigacion/textos.md` (copy deck completo)
- Inspector A → verifica contra la spec y consolida `docs/investigacion/brief.md`.

### Base (coordinador)
Andamiaje, tokens (Dala/Apple), Inter, tema claro/oscuro, transiciones de página, Lenis, componentes base, personajes, barra y pie del sitio, fondo de partículas, cliente de Supabase.

### Grupo B — Construcción (en paralelo)
| Constructor | Carpetas propias |
|---|---|
| 1 · Landing | `app/(site)/**` (excepto `layout.tsx`), `app/not-found.tsx`, `components/landing/**` |
| 2 · Panel y backend | `app/pruebalo/(tablero)/**`, `app/(app)/panel/**`, `components/dashboard/**`, `lib/demo/tablero.ts`, `lib/db/panel.ts`, `supabase/**`, `middleware.ts`, `app/auth/**`, `app/salir/**`, `app/api/lista/**`, `app/api/contacto/**` |
| 3 · Chat | `app/pruebalo/chat/**`, `app/(app)/chat/**`, `app/api/chat/**`, `components/chat/**`, `lib/chat/**`, `lib/demo/chat.ts`, `lib/db/chat.ts` |

Contrato de datos compartido: `lib/db/types.ts` (lo escribe el coordinador; nadie lo cambia sin avisar).
Nadie crea `app/pruebalo/layout.tsx` ni `app/(app)/layout.tsx`.
- Inspector B → lint + build, revisa reglas, arregla integración.

### Grupo C — Calidad (después de construir)
1. Revisor visual (1440/390, oscuro/claro, capturas)
2. Revisor de textos y reglas
3. Revisor de accesibilidad y movimiento
- Inspector C → aplica/valida, build final, capturas finales.

### Cierre (coordinador)
Juntar todo, revisar capturas, commit y push a `claude/nifty-newton-xwp10n`, explicar al dueño.
