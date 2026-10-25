# Investigación visual — Atendel (Grupo A)

Leyenda: **[V]** verificado en fuente (URL al final) · **[M]** de memoria/convención, medir antes de fijar · **[E]** estimación mía, medir en dispositivo.
Método: `last30days` se corrió una vez y devolvió ruido (HN sobre materia oscura; GitHub y Reddit con 403): sin aportes. Después, 6 búsquedas web y 3 lecturas. `vercel.com/design.md` no publica los números (viven en un CSS aparte); los valores de Geist salen del resumen de la búsqueda y de la spec. La spec gana en todo choque.

## 1. Hero de partículas (burbuja → 4 círculos)

**Decisión: WebGL2 instanciado, sin three.js (~120 líneas propias).** Con respaldo de un cuadro estático en Canvas 2D si no hay WebGL2.
- Un triángulo base (3 vértices) + atributos por instancia: A, B, vector de dispersión, retraso, color A/B, tamaño. Morph, dispersión y retraso se calculan en el vertex shader. JS solo manda `uP` y `uTime` por cuadro: CPU ≈ 0 ms [E]. Canvas 2D tendría que rellenar ~4 500 subtrazados por cuadro: pasa en escritorio, se arrastra en Android de gama baja [E].
- Datos externos: WebGL 10 000+ partículas a 60 fps [V, tutorial]; Canvas 2D "bien con cientos, no con miles" [V, blog de proveedor]; Nexus 5 en 2014: 360 sprites a 30 fps en Canvas 2D vs ~17 500 en WebGL [V, antiguo]. Ninguna fuente mide morph: los techos son estimaciones.
- Fondo fijo de la spec (40–70 triángulos sueltos): Canvas 2D dibujado **una vez** (y al redimensionar), sin loop = 0 CPU. Así solo hay 1 contexto WebGL (Safari limita contextos).
- **Cantidad (manda la densidad visual, no los fps).** 1440: canvas 600×600 CSS px, **4 500** partículas, triángulo de 4–6 px de lado (cubre ~60 % de la silueta). 390: canvas `min(100% − 32px, 360px)` cuadrado, **1 900**, lado 3.5–5 px. 768: 3 200. Techo técnico: 20–30 k escritorio, 8–10 k celular [E].
- Calidad adaptativa: se barajan una vez y se dibujan las primeras `n` (`drawArraysInstanced(…, n)`). Si el promedio de 30 cuadros pasa de 20 ms, `n × 0.7` (piso 1 200), nunca sube. Con `hardwareConcurrency ≤ 4` o `deviceMemory ≤ 4`, arrancar en 70 %.
- DPR tope 2 en escritorio y 1.75 en celular. `antialias:false`; el borde se suaviza en el fragment shader.
- Triángulo: relleno + borde de 1 px en shader (distancia baricéntrica con `fwidth`), sin blending aditivo, sin glow, sin `shadowBlur`. Alfa por partícula 0.55–0.9 oscuro, 0.45–0.6 claro. Mantener el canvas fuera de la columna del texto.

**Muestreo de formas**
- Canvas fuera de pantalla de 384² (escritorio) / 256² (celular), `getContext('2d',{willReadFrequently:true})`. Forma dibujada en coordenadas unitarias [−1,1] con `setTransform(S/2,0,0,S/2,S/2,S/2)` y `Path2D`; huecos (ojos, puntos) con `globalCompositeOperation='destination-out'`. `getImageData` **una sola vez** al montar. No se re-muestrea al redimensionar: las posiciones son unitarias y el tamaño llega por uniform.
- Elegir puntos: lista de píxeles con alfa > 127, rejilla de salto `s = √(área_px / N)` y un píxel al azar por celda (elegir píxeles al azar deja grumos). Si faltan, completar con jitter ±0.5 px. PRNG con semilla (`mulberry32`) para que servidor, cliente y recargas den lo mismo.
- Emparejar A_i↔B_i ordenando ambas listas por (ángulo alrededor del centro, radio): viajan en abanico y no se cruzan todas. Después barajar el orden de dibujo (para el `n` adaptativo).
- Paridad de áreas: burbuja ≈ 2.14 u², cuatro círculos ≈ 2.39 u² (+12 %): la densidad casi no cambia al transformar.

**Interpolación con dispersión intermedia**
- Por partícula: `d` (retraso 0–1) y `S` (vector al azar en disco unidad). GLSL: `float t=clamp((uP-d*.35)/.65,0.,1.); float e=t*t*(3.-2.*t); vec2 p=mix(A,B,e)+S*(4.*e*(1.-e))*uSpread;`. La envolvente `4e(1−e)` vale 0 en los extremos y es máxima a la mitad: se deshace y se vuelve a armar. `uSpread` 0.55 escritorio, 0.40 celular.
- Color `mix(cA,cB,e)`. Giro del triángulo ≤ 0.6 rad en el trayecto (la spec §3.5 prohíbe giros en la UI; aquí es la materia de la ilustración: si se objeta, giro 0).
- Mapa de scroll: contenedor de 240 svh (escritorio) / 200 svh (celular) con escenario `position:sticky; top:0; height:100svh`. `s = (scrollY − top) / (alto − 100svh)`. 0–0.20 burbuja quieta (deriva ±1.5 px), 0.20–0.75 morph, 0.75–1 cuatro círculos y se despega. Suavizado `uP += (s − uP) * 0.12` por cuadro (con Lenis en escritorio, scroll nativo en celular). El texto cambia con dos bloques que se cruzan por opacidad en la misma celda de la rejilla.
- Carga (≤ 1.2 s): `uAssemble` 1→0 en 900 ms con ease-out; canvas entra en opacidad 600 ms; se inicia tras el primer `requestAnimationFrame` y con `dynamic(() => import(...), { ssr:false })` para no tocar el LCP.

**Pausa fuera de vista**
- `IntersectionObserver` sobre el contenedor (`rootMargin:'200px 0px'`): fuera de vista, `cancelAnimationFrame` y sin trabajo en scroll. `visibilitychange` oculto = pausa.
- Render bajo demanda: el loop corre solo si `|s − uP| > 0.0005` o hay deriva de reposo (apagada en celular; 30 fps en escritorio) [E]. `webglcontextlost` → `preventDefault()`; `webglcontextrestored` → recrear buffers.
- `prefers-reduced-motion`: un cuadro con `uP = 0`, sin loop ni listeners; en la sección del equipo, el mismo componente con `progress={1}` estático. Canvas `aria-hidden="true"`: el sentido va en el texto.

**Figura 2: validada, 2×2 círculos = los 4 agentes**
- Geometría (unidades [−1,1]): centros (±0.5, ±0.5), R = 0.44 (separación 0.12, no se tocan), 2 ojos huecos por círculo (r = 0.05 en (±0.14, −0.05)) = blob con carita. Burbuja: rectángulo redondeado 1.7×1.3 con radio 0.45 y cola abajo-izquierda, con 3 puntos huecos (r = 0.07, separados 0.30) = "escribiendo".
- Por qué funciona: (1) una masa → cuatro masas: la dispersión se lee como "se deshace y se reparte"; (2) sentido de producto: un mensaje → un equipo; (3) el 2×2 cabe en 340 px (círculos de ~150 px), una fila de 4 daría ~75 px y ojos ilegibles; (4) en 340 px el ojo mide 8.5 px de radio = ≥4 triángulos de ancho, se ve. Descartadas: cerebro (es de Dala), cohete/corazón/palomita (lugar común), apretón de manos (no dice "agentes").
- Color: burbuja en familia azul (`#2f5fff`, `#8aa6ff`, `#5b7cff`) + `#bdbdbd` al 15 %. Cada partícula adopta el color del círculo destino: Lola `#ff6a4d`, Clara `#3cc4f5`, Víctor `#f6b63a`, Iris `#9b7bff` (en claro, los profundos).

## 2. Modo claro estilo Vercel/Geist (solo estilo)

- Base Geist: background-100 `#ffffff`, background-200 `#fafafa`, gray-100 `#f2f2f2`, gray-1000 `#171717` [V, resumen de design.md]. gray-400 se reporta `#eaeaea` [V] y la spec usa `#ebebeb`: conservar spec (1 punto de diferencia). Texto 3 `#666666` = gray-900 [M]. Borde fuerte `#d4d4d4` (spec; Geist gray-500 ≈ `#c9c9c9` [M]).
- Contrastes calculados: `#666` sobre `#fafafa` 5.5:1 y sobre `#f2f2f2` 5.1:1; blanco sobre `#2f5fff` 5.0:1 (pasa AA justo: no aclarar el azul); `#1f4fe0` sobre `#fff` 6.5:1.
- Radios: botón, campo, tarjeta 6px; menú, popover, modal 12px; etiquetas/badges 9999px de 20–24 px de alto [M]. Una sola escala de radio por modo (nunca 12–16 px "para todo").
- Controles Geist: alto 32 / 40 / 48 px, texto 14 / 14 / 16 px peso 500, relleno horizontal 12 / 16 / 20 [M]. Usar 40 (escritorio) y 44 (celular, objetivo táctil) en botón principal y campos; 32 en controles secundarios.
- Etiqueta mono: Geist Mono 12px/16px, MAYÚSCULAS, tracking 0.04em (~0.5px), peso 500, `#666`; activa o con dato vivo, `#1f4fe0` [M, práctica del sitio de Vercel; no es token verificado]. Horas y cifras: Geist Mono 13px con `tabular-nums`.
- Títulos peso 450, tracking −0.05em, interlineado 0.95–1.0. H1 `clamp(2.75rem, 1.2rem + 6.5vw, 6.5rem)` (44px en 390; tope 104px desde ~1360). H2 `clamp(2rem, 1rem + 3.4vw, 4rem)`. Párrafo 17–18px/1.55 peso 400, `max-w-[62ch]`.
- Borde 1px `#ebebeb`; en hover de tarjeta pasa a `#d4d4d4`, sin elevación. Tarjeta `#fff` sobre `#fafafa` o sobre la banda `#f2f2f2`: salto de tono + borde bastan, cero sombras.
- **Matiz sin ser blanco y negro (todo dentro de la spec):**
  1. Alternar `#fafafa` y banda `#f2f2f2` a ancho completo, con borde `#ebebeb` arriba y abajo (la banda sola se ve plana).
  2. Rejilla de puntos en la portada: puntos de 1px `#d4d4d4`, celda de 24 px, solo los primeros ~100 svh, con `mask-image: linear-gradient(#000 40%, transparent)`. Alternativa: líneas de 1px `#ebebeb` cada 64 px. Sin cruces "+" ni guías punteadas (adorno de herramienta de diseño).
  3. Partículas tenues de color (azules profundos + gris) y personajes a color de ≥ 96 px dentro de fichas blancas, con los colores profundos de la spec §3.2.
  4. Azul solo en acción y foco: anillo 2px `#2f5fff` con separación 2px, `::selection` `#2f5fff` al 20 %, enlaces `#1f4fe0` subrayados 1px (offset 3px), línea de 2px bajo el elemento activo del menú.
  5. Opcional, requiere OK porque no está en la spec: un tono `#eef2ff` para UNA banda (cierre o lista de espera).

## 3. Home de GitHub (2025–2026), estructura sin marca

- Barra superior: **64 px** en escritorio (56 px celular), relleno lateral 32 px (16 px celular), borde inferior 1px; hamburguesa de 32×32 a la izquierda bajo 768 px [V parcial: Primer usa 64 en su ejemplo y una galería de terceros reporta header de 64].
- Lateral izquierdo **256 px** (variante estrecha, `minWidth` por defecto) y panel derecho **296 px** (por defecto; también 344 px "ancho") [V: Primer PageLayout y primer/css #1738]. Sticky con `top:0; height:100vh`. Bajo **768 px** el lateral pasa a pantalla completa o cajón [V]. Columna central flexible, lectura máx. ~720–760 px [M].
- Texto base **14px / 20px** (interlineados sobre rejilla de 4 px [V]); meta 12px/18; título de tarjeta 14px peso 600; H1 de página 24–32px peso 600; botón 14px peso 500 [M].
- Botón: alto **32 px** (28 chico, 40 grande), relleno horizontal 12 px, borde 1px, radio 6px, ícono 16 px; botón de ícono 32×32 [V parcial, tercero]. En celular subir a 40–44 px.
- Fila de navegación lateral: 32 px, radio 6px, relleno 0 8px, 2 px entre filas, ícono de 16 px + 8 px. Activa: un escalón de tono (+6–8 % de blanco), sin barra de color.
- Tarjeta de panel: borde 1px (`#3d444d` oscuro, `#d1d9e0` claro), radio 6px, cabecera de 44–48 px con título 14/600 y acción a la derecha, cuerpo con 16 px de relleno, sin sombra. Filas de lista 40–48 px separadas por 1px.
- Búsqueda en barra: 32 px, radio 6px, ~272 px de ancho en escritorio [M]; en celular, botón de ícono.
- Para no copiar marca: sin octocat, sin el verde de su botón (el nuestro es `#2f5fff`), sin sus textos ni su orden exacto de módulos.

## 4. Chat de IA moderno: medidas

- Panel de conversaciones: **260 px** [V indirecto: aparece en estilos de usuario de ChatGPT]; en Atendel 280 px por nombres más largos [E]. Celular: cajón `min(320px, 85vw)`. Fila **36 px** (44 en celular), radio **10 px**, relleno 0 12px, texto 14/20, 2 px entre filas. Activa = tono de la píldora (`#2a2a2a` / `#ececec`). Grupos ("Hoy", "Ayer") 12px `#a3a3a3`, 28 px de alto. Sin líneas entre filas. "Nueva conversación": 40 px, radio 9999, contorno.
- Encabezado del chat: 56 px; blob del agente de 32 px + nombre 15px/500; hamburguesa 40×40 bajo 1024 px.
- Columna de mensajes: máx. **768 px** [M; un estilo de usuario de ChatGPT la fuerza a `max(40rem, 90%)`], centrada; relleno 16 px (celular) / 24 px; 24–32 px entre turnos. Texto del asistente sin contenedor, **16px / 26px**, ≤ 70 caracteres por línea.
- Píldora del usuario: a la derecha, ancho máx. **80 %** (celular 85 %), relleno **10×18 px**, radio **24 px** (no 9999: con 2+ líneas se deforma), fondo `#2a2a2a` / `#ececec`, texto 16/24. Una línea = 44 px de alto.
- Tarjeta de resultado: radio **24 px**, relleno 20 px (celular 16), 12 px entre elementos, sin borde ni sombra. Título 15px/500, cuerpo 14px/20 `#a3a3a3`, acciones de 36 px con radio 9999. Aprobación: un solo botón azul por pantalla (el de la tarjeta pendiente más reciente); las demás, en contorno.
- Caja de escribir: ancho de la columna, alto mínimo **56 px**, radio **28 px**, relleno 8 8 8 20, textarea **16 px**/24 (≥ 16 evita el zoom de iOS), crece hasta ~8 líneas (~200 px) y luego hace scroll interno. Botón enviar **36 px** circular con zona táctil de 44 px (`::after`): azul `#2f5fff` con texto, `#333`/`#d4d4d4` vacío. Sin borde visible; `:focus-visible` con anillo azul 2px y separación 2px, y el relleno sube un tono (`#242424`). Margen inferior 16 px + `env(safe-area-inset-bottom)`; 120 px de colchón bajo el último mensaje.
- Línea de estado: 24 px de alto sobre la caja; punto de **8 px** del color del agente + texto 14px `#a3a3a3` ("Lola está revisando la agenda…"). Opacidad 0.55↔1 en 1.6 s solo mientras trabaja; al terminar sale en 200 ms. Verbos concretos por etapa.
- Horas en Geist Mono 12px `#a3a3a3`. Estado vacío: blob de 96 px + una frase + 3 sugerencias en píldoras de contorno de 40 px. Fondo y superficies, los de la spec §3.4.

## 5. Las 10 señales de "hecho por IA" (2026) y qué hacer

1. **Degradados violeta/índigo, brillos, texto con degradado** (Show HN: "VibeCode Purple", degradados y glows en casi todo). → Todo plano, un azul `#2f5fff`, sin sombras de color ni `backdrop-filter`. Iris (`#9b7bff`) es violeta: vive solo en su personaje.
2. **Fuente o par "de moda"** (Inter; Space Grotesk, Instrument Serif y Geist figuran entre los pares típicos de LLM). La spec manda Geist, así que la diferencia va en el uso: 5 tamaños muy separados (12/15/18/44/104), peso 450, tracking −0.05em, sin serif cursiva ni palabra destacada en otro color.
3. **Etiqueta diminuta en mayúsculas sobre cada título y píldora "Nuevo/Beta" sobre el H1** (taste-skill: 16 % de sitios top contra 57 % de débiles). La spec pide mono en claro: conservarlo con función. Máx. 1 por sección y solo con dato (agente + área, hora, estado); ninguna sobre el H1; sin píldora de novedad. En oscuro, frase normal 14px `#9a9a9a`.
4. **Tres tarjetas iguales con ícono en cuadrito redondeado, bento, mismo molde en todas las secciones.** → Personajes en vez de íconos. Los 4 agentes no son 4 tarjetas gemelas: cada uno con su mensaje de ejemplo y su composición (lados alternados, spec). En claro, máx. 1 fila de tarjetas por página.
5. **Fade-up idéntico en cada bloque, hover que levanta, bucles infinitos.** La spec exige revelar una vez (70 ms, 24 px): mantenerlo, pero que la firma sea el morph de partículas; una lista = un bloque, hover sin elevación, sin bucles decorativos.
6. **Fondo de partículas flotantes + degradados + fade en todo** (reseña de 12 sitios de startups; fuente exacta sin verificar). Riesgo directo para esta spec. → Partículas con sentido (burbuja → equipo); fondo fijo de 40–70 con alfa ≤ 0.35; sin seguir al cursor ni glow; quietas con reduced-motion.
7. **Falso panel de barras grises, punto "en vivo" pulsante, banda de cifras** ("+10 000 negocios"). → Solo fragmentos reales con el guion de Estudio Luna y "Datos de ejemplo"; cero cifras (regla 1). El punto de la línea de estado del chat sí es estado real.
8. **Prueba social inventada: logos, citas, estrellas.** → Regla 1: nada. La prueba es el mecanismo visible: "nada sale sin tu visto bueno" mostrado en una ficha de aprobación.
9. **Copy de plantilla**: "desbloquea/potencia/transforma", "no es solo X, es Y", tres adjetivos seguidos, "Empieza ahora / Saber más", rayas largas. → Sumar a la lista de la spec §2.5: sin tricolon ("rápido, simple y seguro"), ≤ 2 rayas largas por página, botones con verbo concreto ("Entrar con mi correo", "Unirme a la lista"), títulos de ≤ 8 palabras y ≤ 2 líneas en 1440 (≤ 4 en 390).
10. **Todo centrado + héroe titular/subtítulo/dos botones/captura; un radio medio (12–16 px) en todo; sombra bajo cada tarjeta; barra flotante con blur; borde de color en tarjetas; emojis.** → Spec: dos columnas que alternan, un solo centrado (el cierre), radios 9999/6 por modo, cero sombras, barra plana y sólida, sin bordes de color ni emojis.
- Prueba final de 10 s: tapa el logo. Si no se nota que es de agentes para personas (blobs, burbuja → equipo, Estudio Luna), falta una idea, no más adornos (taste-skill §8).

## Para arbitrar (choques con la spec)

- Colores de agentes en los 4 círculos de partículas (spec §3.2 los limita a personajes; aquí los círculos son los personajes). · Alfa de la constelación hero > 0.35 (el tope de la spec es del fondo). · Giro ≤ 0.6 rad del triángulo (spec §3.5). · Tono extra `#eef2ff`. · Mono en claro: se mantiene, con límite de uso.

## Fuentes

- Vercel design.md (estructura de tokens): https://vercel.com/design.md · Geist: https://vercel.com/geist
- Primer PageLayout (768 px, minWidth 256): https://primer.style/components/page-layout · Tipografía: https://primer.style/foundations/typography
- Sidebar 296/256/344: https://github-redirect.dependabot.com/primer/css/issues/1738 · Header 64 y botón 32 (tercero): https://www.oppadu.com/tools/design-systems-site/brand/github-primer.html
- Show HN, patrones de diseño de IA: https://adriankrebs.ch/blog/design-slop/ · https://github.com/Laith0003/ux-skill/wiki/How-to-detect-AI-slop-in-your-design
- Canvas 2D vs WebGL: https://dev.to/hexshift/building-a-custom-gpu-accelerated-particle-system-with-webgl-and-glsl-shaders-25d2 · https://seatmap.pro/blog/webgl-vs-canvas-2d-seating-chart-rendering/ · https://news.ycombinator.com/item?id=9333910 · https://lists.w3.org/Archives/Public/public-whatwg-archive/2014Aug/0038.html
- Chat (indirectas): https://www.assistant-ui.com/examples/chatgpt · https://userstyles.world/style/22125/chatgpt-all-wide · https://userstyles.world/style/11408/chatgpt-material-dark-with-wide-mode-option
- Locales: DESIGN_12.md (Dala) y taste-skill `references/tells.md`.
