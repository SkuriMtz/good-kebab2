# Atendel — Copy deck (español de México, de tú)

Reglas aplicadas: spec §2. Sin tipos de negocio, sin cifras, sin testimonios, sin emojis, sin marcas ajenas. Horas "5:00 pm".
Los textos entre `{llaves}` son variables. "Datos de ejemplo" va visible donde haya Estudio Luna.

## 0. Vocabulario (para afinar tono)

La búsqueda no dio testimonios directos de dueños; el vocabulario sale de lo que sí se repite en notas sobre pymes y WhatsApp.
- Usar: "contestar", "dejar en visto" (solo en el 404 o como guiño), "cita", "mover la cita", "que no llegue", "que no regrese", "se junta el correo", "factura", "fecha límite", "papeleo", "visto bueno".
- Evitar: jerga de software ("gestionar", "optimizar", "leads", "embudo") y cualquier palabra de un tipo de negocio concreto; preferir "duda" y "cliente".
- Siempre "agente" (no "bot"). Siempre "tu equipo". "IA" se menciona poco y sin adornos.

## 1. Barra

- Marca: Atendel
- Enlaces (5): Agentes · Precios · Preguntas · Pruébalo · Contacto
- Acción (contorno, no azul): Entrar
- Cambio de tema (botón de ícono). aria-label en oscuro: "Cambiar a modo claro". En claro: "Cambiar a modo oscuro".
- Etiqueta corta visible si hay espacio: "Claro" / "Oscuro"
- Hamburguesa (solo ícono): aria-label "Abrir menú" / "Cerrar menú"
- Ancla "Preguntas" lleva a la sección "Posibles preguntas".

## 2. Portada

- Etiqueta: Para negocios que atienden personas
- Título (exacto): Que ningún cliente se quede sin respuesta
- Párrafo (29 palabras): Cuatro agentes de IA contestan tu WhatsApp, ordenan tu correo, buscan a quien dejó de venir y preparan tus documentos. Lo importante nunca sale sin que tú lo apruebes.
- Campo, placeholder: tu@correo.com
- Campo, etiqueta (oculta, para lector de pantalla): Tu correo
- Botón (azul, único): Únete a la lista
- Enlace de texto opcional bajo el botón: Ver a Lola en acción (ancla a la demo)
- Texto pequeño: Solo usamos tu correo para avisarte de Atendel.

Estados (mismos en la sección Lista de espera):
- Enviando: Guardando tu correo…
- Éxito: Listo, ya estás en la lista. Te escribimos pronto.
- Ya estabas (yaEstaba): Ya estabas en la lista. No tienes que hacer nada más.
- Correo inválido (correo_invalido): Ese correo no se ve bien. Revísalo e intenta otra vez.
- Error (error): No se pudo guardar. Intenta de nuevo en un momento.
- No configurado (no_configurado): La lista aún no recibe correos. Escríbenos desde Contacto y te anotamos.

## 3. Agentes

- Título de sección: Tu equipo de agentes
- Subtítulo: Cada uno se encarga de lo suyo. Tú decides qué sale.

### Lola · Atención
- Línea: Contesta tu WhatsApp a cualquier hora. (6)
- Ficha: Responde precios, horarios y formas de pago · Agenda y confirma citas · Recuerda la cita a tu cliente · Reagenda cuando alguien no puede · Te avisa cuando un caso necesita a una persona
- Nunca sin tu permiso: Dar un descuento o cambiar un precio.

### Clara · Correo
- Línea: Resume tu correo y marca lo urgente. (7)
- Ficha: Lee el correo del día · Lo resume · Lo ordena por urgencia · Detecta facturas y su fecha límite · Propone respuestas
- Nunca sin tu permiso: Enviar una respuesta.

### Víctor · Clientes
- Línea: Trae de regreso a quien dejó de venir. (8)
- Ficha: Busca a quien no viene desde hace tiempo · Escribe un mensaje personal · Da seguimiento a quien preguntó y no agendó · Pide reseñas
- Nunca sin tu permiso: Mandar un mensaje a tus clientes.

### Iris · Oficina
- Línea: Redacta, compara y arma tus reportes. (7)
- Ficha: Redacta documentos, cartas y resúmenes · Arma el reporte del mes · Compara precios y proveedores · Explica trámites con palabras claras
- Nunca sin tu permiso: Firmar o enviar un documento.

Etiqueta de la ficha: "Qué hace" · "Nunca sin tu permiso"

## 4. Para quién es

- Título de sección: Para quién es

### Trabajas con citas
Alguien pregunta por un horario mientras atiendes a otra persona, y cuando contestas ya se fue. O la cita se cae y te enteras tarde.
- Lola: Contesta, agenda, confirma y recuerda; reagenda si no pueden.
- Clara: Pone arriba el correo urgente para que no choque con tu día.
- Víctor: Da seguimiento a quien preguntó y no llegó a agendar.
- Iris: Redacta las indicaciones que mandas antes de una cita.

### Te escriben a todas horas
Los mensajes llegan de noche, en domingo, mientras comes. Contestarlos todos te cansa; dejarlos en visto te cuesta clientes.
- Lola: Responde precios, horarios y formas de pago a cualquier hora.
- Clara: Resume tu correo para que lo revises una vez, no todo el día.
- Víctor: Retoma a quien preguntó y no volvió a escribir.
- Iris: Redacta las respuestas largas que no caben en un chat.

### Vives de que tus clientes regresen
Alguien vino una vez y pasaron los meses sin que nadie le escribiera. Un mensaje a tiempo cambia eso.
- Lola: Agenda en cuanto el cliente responde.
- Clara: Propone respuesta al correo de quien sigue esperando.
- Víctor: Escribe un mensaje personal a quien no viene hace tiempo y pide reseñas.
- Iris: Arma el reporte del mes para que veas cómo vas.

### El papeleo te quita tiempo
Facturas con fecha límite, cartas, reportes, trámites que no terminas de entender. Siempre es lo que dejas para después.
- Lola: Te avisa cuando un cliente pide algo que solo tú puedes resolver.
- Clara: Detecta facturas en tu correo y cuándo vencen.
- Víctor: Manda los seguimientos que tocan, con tu visto bueno.
- Iris: Redacta documentos, compara proveedores y explica trámites.

## 5. Demo de chat (guion local, no llama a la IA)

- Título de sección: Así contesta Lola
- Introducción: Un cliente escribe por WhatsApp a las 9:41 pm. Así lo atiende Lola.
- Encabezado del chat: Estudio Luna · Lola · Datos de ejemplo
- Pie del chat (fijo): Demostración con un guion. Lola no está respondiendo en vivo.
- Caja de escribir (deshabilitada): Toca una sugerencia para seguir

Mensajes (C = cliente, L = Lola):
1. C, 9:41 pm: Hola, buenas noches. ¿Cuánto cuesta la sesión de 1 hora?
2. L, 9:41 pm: Hola, Marta, buenas noches. Soy Lola, la asistente de Estudio Luna. La sesión de 1 hora cuesta $450.
   - Nota bajo el mensaje (chip pequeño): Precio de ejemplo. Lola usa el que tú definas.
3. C, 9:42 pm: ¿Hasta qué hora atienden?
4. L, 9:42 pm: De lunes a sábado, de 10:00 am a 7:00 pm.
5. C, 9:42 pm: ¿Tienen lugar este jueves?
6. L, 9:42 pm: Sí. El jueves tengo 11:00 am, 3:00 pm y 5:00 pm. ¿Cuál te acomoda?
7. C, 9:43 pm: A las 5:00 pm, por favor.
8. L, 9:43 pm: Listo, Marta. Te agendé una sesión de 1 hora el jueves a las 5:00 pm. Antes de la cita te mando un recordatorio.
   - Tarjeta de resultado: Cita agendada · Jueves, 5:00 pm · Sesión de 1 hora
9. C, 9:44 pm: Gracias. ¿Y si llevo a una amiga, me hacen descuento?
10. L, 9:44 pm: Eso lo decide Ana y no quiero prometerte algo que no sé. Ya le avisé; te responde en cuanto pueda.
   - Tarjeta de aviso (a Ana): Lola le avisó a Ana · Marta, con cita el jueves a las 5:00 pm, pregunta si hay descuento al llevar a una amiga. Este caso necesita a una persona.

Sugerencias (3 botones de contorno, aparecen tras el mensaje 10; al tocar, el texto sale como mensaje del cliente):
- "¿Puedo pagar con tarjeta?" → L: Sí, aquí se acepta tarjeta, transferencia y efectivo. Son las formas de pago que Ana dejó configuradas.
- "Quiero cambiar mi cita" → L: Claro. Tu sesión es el jueves a las 5:00 pm. Tengo el viernes a las 11:00 am o el sábado a las 3:00 pm. Cuando elijas, la muevo y le aviso a Ana.
- "¿Qué haces si no sabes algo?" → L: Te lo digo y le aviso a Ana. No invento respuestas ni prometo lo que no me toca.
- Tras cualquiera: Esto es una demostración. Para ver el panel completo, entra a Pruébalo. (enlace de texto "Pruébalo")

## 6. Precios

- Título de sección: Precios
- Subtítulo: Empieza gratis. One y Max llegan pronto; todavía no publicamos su precio.

### Free
- Precio: Gratis
- Incluye: A Clara, tu agente de correo · Pocos mensajes al mes · Entras con tu correo, sin contraseña
- Botón (azul, el único de la sección): Empezar gratis (lleva a /entrar)

### One
- Precio: Próximamente
- Incluye: A Lola y a Clara · Lola contesta tu WhatsApp y agenda tus citas · Los mensajes al mes se anunciarán con el precio
- Botón (contorno): Únete a la lista

### Max
- Precio: Próximamente
- Incluye: Los cuatro agentes: Lola, Clara, Víctor e Iris · Tú eliges tu equipo · Muchos más mensajes al mes
- Botón (contorno): Únete a la lista

- Nota al pie de la sección: Los precios de One y Max no están definidos. Si te unes a la lista, te avisamos primero.

## 7. Posibles preguntas

- Título de sección: Posibles preguntas
1. ¿Es difícil de usar? — Entras con tu correo, sin contraseña, y les escribes a los agentes como le escribirías a alguien de tu equipo.
2. ¿Sirve para mi negocio? — Si das servicio, trabajas con citas, recibes mensajes de clientes o vives de que regresen, sí. Empieza con Free y mira si te quita trabajo.
3. ¿Qué pasa si un agente se equivoca? — Lo importante nunca sale sin tu visto bueno: tú apruebas antes de enviar. Y cuando un caso no es claro, el agente te avisa en vez de inventar.
4. ¿Los agentes contestan solos? — Lola responde lo de todos los días: precios, horarios, formas de pago y citas. Cuando un caso necesita a una persona, te avisa.
5. ¿Necesito una contraseña? — No. Escribes tu correo, te llega un enlace y entras.
6. ¿Cuánto cuesta? — Free es gratis e incluye a Clara. One y Max llegan pronto y todavía no tienen precio publicado. Si te unes a la lista, te avisamos.
7. ¿Puedo elegir qué agentes uso? — Con Max eliges tu equipo entre los cuatro. Free incluye a Clara y One suma a Lola.
8. ¿Puedo verlo antes de unirme? — Sí. En Pruébalo ves el panel y los chats con datos de ejemplo de Estudio Luna.

## 8. Páginas y cierre

### Lista de espera (sección final)
- Etiqueta: Lista de espera
- Título: Te avisamos primero
- Párrafo: Deja tu correo y te escribimos cuando One y Max estén listos, con su precio. Mientras tanto puedes usar Free.
- Selector opcional (etiqueta): Plan que te interesa · Opciones: Cualquiera · One · Max
- Campo, placeholder: tu@correo.com
- Botón (contorno aquí, para que el azul sea solo el de Free o el de la portada): Únete a la lista
- Texto pequeño: Solo usamos tu correo para avisarte de Atendel.
- Estados: los mismos de la Portada.

### Contacto (/contacto)
- Título: Escríbenos
- Párrafo: Cuéntanos qué necesitas o qué te gustaría que hiciera un agente. Te respondemos por correo.
- Campos: Nombre (placeholder "Tu nombre") · Correo (placeholder "tu@correo.com") · Mensaje (placeholder "¿En qué te podemos ayudar?")
- Botón (azul): Enviar mensaje
- Enviando: Enviando tu mensaje…
- Éxito: Mensaje enviado. Te respondemos por correo.
- Faltan campos (campos): Falta algo. Revisa tu nombre, tu correo y el mensaje.
- Correo inválido: Ese correo no se ve bien. Revísalo e intenta otra vez.
- Error: No se pudo enviar. Intenta de nuevo en un momento.
- No configurado: El formulario aún no está disponible. Vuelve pronto.

### Entrar (/entrar)
- Título: Entra con tu correo
- Párrafo: Sin contraseña. Escribe tu correo y te mandamos un enlace para entrar.
- Campo: Correo (placeholder "tu@correo.com")
- Botón (azul): Enviarme el enlace
- Enviando: Enviando el enlace…
- Revisa tu correo (título): Revisa tu correo
- Revisa tu correo (texto): Te mandamos un enlace a {correo}. Ábrelo en este mismo navegador para entrar. Si no lo ves, busca en spam.
- Enlaces tras enviar: Usar otro correo · Reenviar el enlace
- Correo inválido: Ese correo no se ve bien. Revísalo e intenta otra vez.
- Error: No pudimos enviar el enlace. Intenta de nuevo en un momento.
- No configurado: Entrar aún no está disponible. Vuelve pronto.
- Enlace vencido o inválido (callback): Ese enlace ya no sirve. Pide uno nuevo con tu correo.

### 404
- Título: Esta página no contestó
- Texto: Ni Lola la encontró, y eso que ella contesta a cualquier hora. Puede que el enlace esté mal escrito o que la página ya no exista.
- Botón (azul): Volver al inicio

### Pie de página
- Marca: Atendel
- Línea: Agentes de IA para negocios que atienden personas.
- Enlaces: Agentes · Precios · Pruébalo · Contacto · Entrar
- Aviso: Los nombres, horarios y precios de Estudio Luna son datos de ejemplo.
- Derechos: © 2026 Atendel

## 9. Datos de ejemplo (panel y Pruébalo · Estudio Luna)

Etiqueta fija en panel, actividad y chat: "Datos de ejemplo". Dueña: Ana. Clientes: Marta y otros, siempre "clientes".

### Actividad de agentes (8 filas, más reciente primero; agente · acción · hora · estado)
1. Iris · Armó el borrador del reporte del mes · 11:05 am · Espera tu visto bueno
2. Víctor · Redactó un mensaje para clientes que no vienen hace tiempo · 10:48 am · Espera tu visto bueno
3. Clara · Detectó una factura que vence el viernes · 10:15 am · Listo
4. Lola · Reagendó una sesión de 1 hora para el viernes a las 11:00 am · 9:58 am · Listo
5. Lola · Avisó a Ana que un cliente pidió un descuento · 9:31 am · Necesita a una persona
6. Clara · Resumió el correo de la mañana y lo ordenó por urgencia · 9:12 am · Listo
7. Lola · Contestó por WhatsApp una duda sobre formas de pago · 8:40 am · Listo
8. Víctor · Preparó una petición de reseña tras una primera visita · 8:05 am · Aprobado por Ana

### Conversaciones (lista lateral: título · último mensaje · agente)
1. Cita del jueves · Listo, Marta. Te agendé el jueves a las 5:00 pm. · Lola
2. Correo de hoy · Hay una factura que vence el viernes. · Clara
3. Clientes que no han vuelto · Dejé el mensaje listo para que lo apruebes. · Víctor
4. Reporte del mes · Ya está el borrador. ¿Lo revisas? · Iris
5. Cambiar una cita · Te propongo el viernes a las 11:00 am. · Lola

### Grupos
- Recepción · Lola + Clara · Atienden tus mensajes y tu correo en un mismo lugar.
- Seguimiento · Víctor + Iris · Traen de regreso a tus clientes y preparan tus reportes.

### Comandos con "/" (comando · agente · descripción)
- /agendar · Lola · Crea o mueve una cita
- /resumir · Clara · Resume un correo o conversación
- /investigar · Iris · Compara precios o proveedores por ti
- /redactar · Iris · Escribe una carta o mensaje
- /recordar · Lola · Programa un aviso para después
- /reporte · Iris · Arma el resumen del mes

### Textos de apoyo del chat de Pruébalo
- Caja de escribir: Escribe un mensaje o usa / para ver comandos
- Respuesta cuando no hay guion: Esto es una demostración con datos de ejemplo. Prueba con uno de los comandos con /.
- Estado vacío de actividad: Aquí verás lo que hacen tus agentes.
- Aviso superior: Datos de ejemplo de Estudio Luna. Nada de esto es real.

## 10. Notas para quien construye

- Los "Nunca sin tu permiso" son compromisos de copy: confirmar con el producto que Lola no da descuentos ni cambia precios sin aprobación, y que Clara, Víctor e Iris no envían nada sin visto bueno.
- Marcar siempre "$450", los horarios y los nombres de Estudio Luna como datos de ejemplo.
- Un solo botón azul por pantalla: portada = "Únete a la lista"; precios = "Empezar gratis"; lista de espera final = contorno; contacto, entrar y 404 = su botón principal.
