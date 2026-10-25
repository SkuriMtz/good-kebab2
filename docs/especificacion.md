# Atendel — Especificación (fuente única de verdad)

Todo agente que trabaje en este proyecto lee este archivo completo antes de empezar.
Si algo de otra referencia (taste-skill, ui-ux-pro-max, DESIGN_11/12) contradice este archivo, **gana este archivo**.

## 1. El negocio

Atendel es una suscripción de agentes de IA para microempresas mexicanas que atienden personas:
cualquier negocio que da servicio, trabaja con citas, recibe mensajes de clientes o vive de que sus
clientes regresen. **Nunca nombres tipos de negocio** (nada de clínicas, estéticas, consultorios,
dentistas, barberías…). Se dice "negocios que atienden personas".

Cuatro agentes, cada uno con un personaje "blob" redondo con carita y color propio:

| id | Nombre | Área | Qué hace |
|----|--------|------|----------|
| `lola` | Lola | Atención | Contesta el WhatsApp a cualquier hora; responde precios, horarios y formas de pago; agenda, confirma, recuerda y reagenda citas; avisa cuando un caso necesita a una persona. |
| `clara` | Clara | Correo | Lee y resume el correo del día; lo ordena por urgencia; detecta facturas con su fecha límite; propone respuestas. |
| `victor` | Víctor | Clientes | Trae de regreso a quien no viene desde hace tiempo con un mensaje personal; da seguimiento a quien preguntó y no agendó; pide reseñas. |
| `iris` | Iris | Oficina | Redacta documentos, cartas y resúmenes; arma reportes mensuales; compara precios y proveedores; explica trámites. |

- Lo importante **nunca sale sin el visto bueno del dueño** (aprobar antes de enviar).
- Se entra con el correo, **sin contraseña** (enlace mágico de Supabase).
- Planes: **Free** (gratis, Clara, pocos mensajes al mes) · **One** (suma a Lola) · **Max** (los cuatro, el usuario elige su equipo, muchos más mensajes).
  Precios de One y Max **no se publican**: "Próximamente" + lista de espera. El usuario **no puede cambiar su propio plan** desde su cuenta.
  En el sitio público no se ponen cifras de mensajes (no están definidas). En la app el límite viene de la base de datos (`plan_limits`).

## 2. Reglas que nunca se rompen

1. Nada inventado: ni testimonios, ni cifras, ni clientes, ni logos de clientes, ni certificaciones, ni "X negocios ya confían".
2. Prohibido "Lo que nos preguntan" y "Preguntas frecuentes". Se usa **"Posibles preguntas"**.
3. El chat de demostración del sitio público es un **guion local**; no llama a la IA.
4. Los ejemplos (demo, Pruébalo, panel) son de un negocio neutro: **"Estudio Luna"**, con **"clientes"** (nunca "pacientes") y servicios genéricos: "sesión de 1 hora", "primera visita", "asesoría". La dueña del ejemplo se llama **Ana**.
5. Español natural de México, de tú, concreto. Prohibido: "revoluciona tu negocio", "lleva tu negocio al siguiente nivel", "descubre el poder de la IA", "potencia", "transforma", "solución integral", "de vanguardia", "sinergia", "impulsa".
6. Nada de marcas ajenas: ni logos, ni nombres (no "WhatsApp Business API" como logo; la palabra "WhatsApp" como canal sí se puede usar en texto), ni textos copiados de las referencias (Dala, Vercel, GitHub, Apple).
7. Claves de IA y de base de datos **nunca** en el código: solo variables de entorno (`.env.local`, ver `.env.example`).
8. Datos de ejemplo siempre marcados como tales ("Datos de ejemplo").
9. Sin emojis en la interfaz.

## 3. Sistema visual

> **Cambio del dueño (gana sobre cualquier versión anterior):** el aspecto se toma de SUS archivos,
> no de descripciones de otras marcas. Modo oscuro = `docs/referencias/oscuro-dala.md` (+ `oscuro-dala-theme.css`).
> Modo claro = `docs/referencias/claro-apple.md` (+ `claro-apple-theme.css`, `claro-apple-variables.css`).
> Léelos completos. Se toma solo el estilo: nunca el nombre, logo ni textos de esas marcas.
> No quiere que se vea como intentos anteriores (nada de estilo Vercel, GitHub ni "app de chat genérica").

Letra: **Inter** variable (el sustituto que piden ambos archivos), auto-alojada. Sin monoespaciada. Números con `tabular-nums`.
Misma estructura de páginas en los dos modos; cambian colores, tipografía (tamaños/pesos), radios y superficies según cada archivo.
Oscuro es el modo por defecto; el claro es opción (botón en la barra).

### 3.1 Modo oscuro (Dala)

| Rol | Valor |
|---|---|
| Lienzo de todo | `#000000` puro. Nunca paneles grises, tarjetas, bordes, divisores ni sombras. El vacío es el diseño. |
| Texto | `#ffffff`; secundario `#9a9a9a` (ash); terciario `#bdbdbd` (silver) |
| Botón principal | `#8052ff` (violeta), texto blanco, radio 24px (píldora en ~45px de alto), 14px peso 600 MAYÚSCULAS tracking 0.025em, padding 14px × 18px. **Uno por pantalla.** |
| Etiqueta/énfasis | `#ffb829` (azafrán): etiqueta pequeña MAYÚSCULAS sobre el texto, enlaces de énfasis |
| Enlaces | blanco o `#ffb829` (nunca azul de navegador) |
| Acento profundo | `#15846e` (verde) solo como tinte de marca/partículas |
| Títulos | peso 400 siempre, tracking -0.04em. display 113px/1.1 · heading-lg 78px/1.1 · heading 48px/1.1 · heading-sm 42px/1.2 · subheading 36px · heading-2xs 24px |
| Párrafos | 18px peso 200 (ultraligero, firma del estilo) interlineado 1.5, blanco o silver |
| Barra | transparente, logo a la izquierda, enlaces 14px peso 600 MAYÚSCULAS 0.025em `#9a9a9a` (activo/hover blanco), botón píldora violeta a la derecha (cuenta como el botón de esa pantalla solo si la sección no tiene otro) |
| Radios | 24px (botones, tarjetas, nav); 9999px solo en piezas muy pequeñas |
| Ritmo | ancho máximo 1280px · unidad 6px · secciones separadas 60–120px · columnas asimétricas que alternan de lado (zigzag) |
| Imagen | constelación de miles de triangulitos de contorno (1–2px) multicolor (violeta, ámbar, verde azulado, magenta, azul) + partículas sueltas tenues alrededor. Sin fotos ni capturas en la portada. |

### 3.2 Modo claro (Apple)

| Rol | Valor |
|---|---|
| Lienzo | `#ffffff`; bandas alternas de ancho completo `#f5f5f7`; capa de navegación abierta `#fafafc` |
| Texto | `#1d1d1f` (ink); secundario `#707070` (slate) |
| Líneas | `#d6d6d6` 1px, escasas; contorno de campos/botón secundario `#86868b` |
| Botón principal | `#0071e3` píldora (9999px), texto blanco. Botón secundario: transparente, borde 1px `#86868b`, texto ink, píldora |
| Enlaces | `#0066cc` |
| Etiqueta de estado | `#b64400` 12px peso 600, texto plano (sin píldora) |
| Títulos | peso 600. hero 80px/1.05 tracking -1.2px (-0.015em) · feature-heading 40px/1.0 · kicker 21px/600 · product-title 19px/600 |
| Párrafos | 17px peso 400 interlineado 1.47 tracking -0.374px; pequeño 14px/1.29 |
| Barra | blanca, 44px de alto, enlaces 12px peso 400 `rgba(0,0,0,.8)`; abierta: `#fafafc` con borde 1px `#e6e6e8` |
| Tarjetas | blancas `#ffffff`, radio **28px**, sin borde ni sombra, sobre banda `#f5f5f7`, padding 28px |
| Campos | blanco, borde 1px `#86868b`, radio 980px |
| Ritmo | unidad 4px · secciones separadas 90px · separación entre elementos 20px |
| Prohibido | gradientes, sombras, píldoras de color para etiquetas, títulos en 700 |
| Imagen | la figura de triangulitos es el "objeto" protagonista sobre blanco, con aire alrededor. Sin partículas sueltas de fondo en claro. |

### 3.3 Personajes (colores propios, solo en ellos)

| Agente | Oscuro | Claro |
|---|---|---|
| Lola | `#ffb829` | `#f2a20c` |
| Clara | `#1fb89a` | `#15846e` |
| Víctor | `#ff5a8a` | `#e8396c` |
| Iris | `#a98bff` | `#7d5cf2` |

### 3.4 App (panel, Pruébalo y chats) con el mismo sistema

- **Oscuro (Dala):** negro puro, sin paneles grises ni bordes: la jerarquía sale del tamaño, el peso y el espacio. Lista lateral, actividad y tarjetas de resultado = texto flotando sobre negro, separado por espacio. **Única excepción** (porque si no, no se ve dónde escribir): la caja de escribir, los campos y la píldora del mensaje del usuario llevan relleno blanco al 7% y radio 24px, sin borde.
- **Claro (Apple):** lienzo `#ffffff`; lateral y bandas `#f5f5f7`; tarjetas blancas de 28px sin sombra sobre `#f5f5f7`; líneas `#d6d6d6` escasas; campos blancos con borde `#86868b` y radio 980px; mensaje del usuario en píldora `#f5f5f7`.
- Estructura y funciones de la app se mantienen (barra superior con buscador e íconos, lateral con Inicio/Actividad/Tus agentes/Grupos/uso del plan, caja "Pídele algo a tu equipo…", tarjetas de resultado, grupos, comandos "/", "escribiendo…", deslizar para borrar), pero con este aspecto.

### 3.5 Movimiento (comportamiento, no aspecto)

- Fino, digno, que se note. Solo opacidad y desplazamiento (translate). Nada de rebotes, giros, escalas exageradas, desenfoques ni cortinas.
- Entradas: `cubic-bezier(0.16, 1, 0.3, 1)` 600–800ms. Salidas: `cubic-bezier(0.4, 0, 1, 1)` 180–240ms (más rápidas).
- Portada: una sola secuencia corta (≤ 1.2s total). Al bajar, cada sección revela sus partes **una sola vez** (título → texto → resto, escalonado 70ms, subida 24px).
- Scroll suave con **Lenis** solo en computadora (puntero fino y ≥ 1024px); scroll nativo en celular.
- Transición entre páginas (View Transitions vía `next-view-transitions`): la barra y el fondo se quedan quietos; el contenido sale (opacidad 1→0, y 0→-16px, 200ms) y entra (opacidad 0→1, y 40px→0, 520ms, 60ms de retraso). **Debe notarse en el celular.**
- Estados diseñados en botones, formularios, menú y fichas: hover, presión (`translateY(1px)` + tono), foco visible (anillo azul 2px con separación), enviando (spinner + texto), éxito, error.
- `prefers-reduced-motion: reduce` → sin animaciones (todo visible de inmediato, sin Lenis, sin transiciones de página, partículas estáticas).

## 4. Rutas

| Ruta | Qué es | Dueño |
|---|---|---|
| `/` | Landing | Grupo B · Constructor 1 |
| `/contacto` | Formulario de contacto | Constructor 1 |
| `/entrar` | Entrar con correo (enlace mágico) | Constructor 1 (UI) |
| `not-found` | 404 propia | Constructor 1 |
| `/pruebalo` | Panel con datos de ejemplo | Constructor 2 |
| `/pruebalo/actividad` | Actividad de ejemplo | Constructor 2 |
| `/pruebalo/chat` (+ `/pruebalo/chat/[id]`) | Chat con datos y respuestas de ejemplo (guion local) | Constructor 3 |
| `/panel`, `/panel/actividad` | Panel real (requiere sesión) | Constructor 2 |
| `/chat`, `/chat/[id]` | Chat real (requiere sesión, llama a la IA) | Constructor 3 |
| `/auth/callback`, `/salir` | Sesión | Constructor 3 |
| `/api/lista`, `/api/contacto`, `/api/chat` | API | Constructor 3 |

### Contratos de API (no cambiar sin avisar)

- `POST /api/lista` body `{ email: string, plan?: "free"|"one"|"max", origen?: string }`
  → `200 {ok:true}` · `200 {ok:true, yaEstaba:true}` · `400 {error:"correo_invalido"}` · `503 {error:"no_configurado"}` · `500 {error:"error"}`
- `POST /api/contacto` body `{ nombre: string, email: string, mensaje: string }` → mismas respuestas (`400 {error:"campos"}` si falta algo).
- `POST /api/chat` body `{ conversationId?: string, agent: AgentId | "grupo", groupId?: string, text: string }` → respuesta en streaming de texto; `401` sin sesión; `402 {error:"limite"}` límite del plan; `403 {error:"agente_no_incluido"}`; `503 {error:"no_configurado"}`.

## 5. Variables de entorno (`.env.example`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ANTHROPIC_API_KEY=
ATENDEL_AI_MODEL=claude-sonnet-5-5
```

## 6. Calidad

- Antes de cada entrega: `npm run lint` y `npm run build` sin errores.
- Revisar en 1440px y 390px, modo oscuro y claro, sin scroll horizontal.
- Accesibilidad: contraste AA, foco visible (anillo del color del botón principal del modo), navegable con teclado, `aria-label` en botones de solo ícono, `lang="es-MX"`.
- En celular: ícono de hamburguesa (nunca un botón que diga "Menú").

## 7. Lo que el dueño NO quiere (no repetir)

- Que se vea genérico, "hecho por IA" o de plantilla.
- Puros cuadrados y cajas sin intención (sobre todo en el chat).
- Un botón que diga "Menú".
- Partículas que brillan demasiado o tapan el texto.
- Modo claro solo blanco y negro sin matices.
- Cambios tan sutiles que no se notan en el celular.
