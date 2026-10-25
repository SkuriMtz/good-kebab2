import type { AgentId, PlanId } from "@/lib/agents";

/**
 * Textos del sitio público. Fuente: docs/investigacion/textos.md (se usan tal cual).
 * Las líneas, fichas y "nunca sin tu permiso" de los agentes viven en lib/agents.ts.
 */

export const HERO = {
  label: "Para negocios que atienden personas",
  title: "Que ningún cliente se quede sin respuesta",
  text: "Cuatro agentes de IA contestan tu WhatsApp, ordenan tu correo, buscan a quien dejó de venir y preparan tus documentos. Lo importante nunca sale sin que tú lo apruebes.",
  demoLink: "Ver a Lola en acción",
};

export const WAITLIST = {
  emailLabel: "Tu correo",
  placeholder: "tu@correo.com",
  button: "Únete a la lista",
  sending: "Guardando…",
  done: "Listo",
  fine: "Usamos tu correo para avisarte de Atendel.",
  planLegend: "Plan que te interesa",
  plans: [
    { value: "", label: "Cualquiera" },
    { value: "one", label: "One" },
    { value: "max", label: "Max" },
  ] as { value: "" | "one" | "max"; label: string }[],
  messages: {
    sending: "Guardando tu correo…",
    ok: "Listo, ya estás en la lista. Te escribimos pronto.",
    already: "Ya estabas en la lista. No tienes que hacer nada más.",
    invalid: "Ese correo no se ve bien. Revísalo e intenta otra vez.",
    error: "No se pudo guardar. Intenta de nuevo en un momento.",
    unconfigured: "La lista aún no recibe correos. Escríbenos desde Contacto y te anotamos.",
  },
};

/* ------------------------------------------------------------------ */
/* Agentes                                                             */
/* ------------------------------------------------------------------ */

export const AGENTS_SECTION = {
  label: "Cuatro agentes",
  title: "Tu equipo de agentes",
  subtitle: "Cada uno se encarga de lo suyo. Tú decides qué sale.",
  sheet: { does: "Qué hace", never: "Nunca sin tu permiso", plan: "En qué plan viene", open: "Ver la ficha de" },
};

export const PLAN_NAMES: Record<PlanId, string> = { free: "Free", one: "One", max: "Max" };

/* ------------------------------------------------------------------ */
/* Para quién es                                                       */
/* ------------------------------------------------------------------ */

export const AUDIENCE_SECTION = { title: "Para quién es" };

export const AUDIENCE: { title: string; text: string; agents: Record<AgentId, string> }[] = [
  {
    title: "Trabajas con citas",
    text: "Alguien pregunta por un horario mientras atiendes a otra persona, y cuando contestas ya se fue. O la cita se cae y te enteras tarde.",
    agents: {
      lola: "Contesta, agenda, confirma y recuerda; reagenda si no pueden.",
      clara: "Pone arriba el correo urgente para que no choque con tu día.",
      victor: "Da seguimiento a quien preguntó y no llegó a agendar.",
      iris: "Redacta las indicaciones que mandas antes de una cita.",
    },
  },
  {
    title: "Te escriben a todas horas",
    text: "Los mensajes llegan de noche, en domingo, mientras comes. Contestarlos todos te cansa; dejarlos en visto te cuesta clientes.",
    agents: {
      lola: "Responde precios, horarios y formas de pago a cualquier hora.",
      clara: "Resume tu correo para que lo revises una vez, no todo el día.",
      victor: "Retoma a quien preguntó y no volvió a escribir.",
      iris: "Redacta las respuestas largas que no caben en un chat.",
    },
  },
  {
    title: "Vives de que tus clientes regresen",
    text: "Alguien vino una vez y pasaron los meses sin que nadie le escribiera. Un mensaje a tiempo puede cambiar eso.",
    agents: {
      lola: "Agenda en cuanto el cliente responde.",
      clara: "Propone respuesta al correo de quien sigue esperando.",
      victor: "Escribe un mensaje personal a quien no viene hace tiempo y pide reseñas.",
      iris: "Arma el reporte del mes para que veas cómo vas.",
    },
  },
  {
    title: "El papeleo te quita tiempo",
    text: "Facturas con fecha límite, cartas, reportes, trámites que no terminas de entender. Siempre es lo que dejas para después.",
    agents: {
      lola: "Te avisa cuando un cliente pide algo que solo tú puedes resolver.",
      clara: "Detecta facturas en tu correo y cuándo vencen.",
      victor: "Manda los seguimientos que tocan, con tu visto bueno.",
      iris: "Redacta documentos, compara proveedores y explica trámites.",
    },
  },
];

/* ------------------------------------------------------------------ */
/* Demo (guion local, no llama a nada)                                 */
/* ------------------------------------------------------------------ */

export type DemoCard =
  | { kind: "cita"; title: string; lines: string[] }
  | { kind: "aviso"; title: string; text: string; status: string };

export type DemoMessage = {
  from: "cliente" | "lola";
  time: string;
  text: string;
  note?: string;
  card?: DemoCard;
};

export const DEMO = {
  label: "Conversación de ejemplo",
  title: "Así contesta Lola",
  intro: "Un cliente escribe por WhatsApp a las 9:41 pm. Así lo atiende Lola.",
  chatTitle: "Estudio Luna",
  chatAgent: "Lola",
  sample: "Datos de ejemplo",
  footer: "Demostración con un guion. Lola no está respondiendo en vivo.",
  composer: "Toca una sugerencia para seguir",
  typing: "escribiendo…",
  suggestionsLabel: "Sugerencias",
  replay: "Ver de nuevo",
  after: { before: "Esto es una demostración. Para ver el panel completo, entra a ", link: "Pruébalo", after: "." },
};

export const DEMO_SCRIPT: DemoMessage[] = [
  { from: "cliente", time: "9:41 pm", text: "Hola, buenas noches. ¿Cuánto cuesta la sesión de 1 hora?" },
  {
    from: "lola",
    time: "9:41 pm",
    text: "Hola, Marta, buenas noches. Soy Lola, la asistente de Estudio Luna. La sesión de 1 hora cuesta $450.",
    note: "Precio de ejemplo. Lola usa el que tú definas.",
  },
  { from: "cliente", time: "9:42 pm", text: "¿Hasta qué hora atienden?" },
  { from: "lola", time: "9:42 pm", text: "De lunes a sábado, de 10:00 am a 7:00 pm." },
  { from: "cliente", time: "9:42 pm", text: "¿Tienen lugar este jueves?" },
  { from: "lola", time: "9:42 pm", text: "Sí. El jueves tengo 11:00 am, 3:00 pm y 5:00 pm. ¿Cuál te acomoda?" },
  { from: "cliente", time: "9:43 pm", text: "A las 5:00 pm, por favor." },
  {
    from: "lola",
    time: "9:43 pm",
    text: "Listo, Marta. Te agendé una sesión de 1 hora el jueves a las 5:00 pm. Antes de la cita te mando un recordatorio.",
    card: { kind: "cita", title: "Cita agendada", lines: ["Jueves, 5:00 pm", "Sesión de 1 hora"] },
  },
  { from: "cliente", time: "9:44 pm", text: "Gracias. ¿Y si llevo a una amiga, me hacen descuento?" },
  {
    from: "lola",
    time: "9:44 pm",
    text: "Eso lo decide Ana y no quiero prometerte algo que no sé. Ya le avisé; te responde en cuanto pueda.",
    card: {
      kind: "aviso",
      title: "Lola le avisó a Ana",
      text: "Marta, con cita el jueves a las 5:00 pm, pregunta si hay descuento al llevar a una amiga.",
      status: "Este caso necesita a una persona.",
    },
  },
];

export const DEMO_SUGGESTIONS: { label: string; reply: string }[] = [
  {
    label: "¿Puedo pagar con tarjeta?",
    reply: "Sí, aquí se acepta tarjeta, transferencia y efectivo. Son las formas de pago que Ana dejó configuradas.",
  },
  {
    label: "Quiero cambiar mi cita",
    reply:
      "Claro. Tu sesión es el jueves a las 5:00 pm. Tengo el viernes a las 11:00 am o el sábado a las 3:00 pm. Cuando elijas, la muevo y le aviso a Ana.",
  },
  {
    label: "¿Qué haces si no sabes algo?",
    reply: "Te lo digo y le aviso a Ana. No invento respuestas ni prometo lo que no me toca.",
  },
];

/* ------------------------------------------------------------------ */
/* Precios                                                             */
/* ------------------------------------------------------------------ */

export const PRICING = {
  label: "Planes",
  title: "Precios",
  subtitle: "Empieza gratis. One y Max llegan pronto; todavía no publicamos su precio.",
  soon: "Próximamente",
  note: "Los precios de One y Max no están definidos. Si te unes a la lista, te avisamos cuando estén listos.",
  plans: [
    {
      id: "free" as const,
      name: "Free",
      price: "Gratis",
      soon: false,
      includes: ["A Clara, tu agente de correo", "Pocos mensajes al mes", "Entras con tu correo, sin contraseña"],
      button: "Empezar gratis",
    },
    {
      id: "one" as const,
      name: "One",
      price: "Próximamente",
      soon: true,
      includes: [
        "A Lola y a Clara",
        "Lola contesta tu WhatsApp y agenda tus citas",
        "Los mensajes al mes aún no están definidos",
      ],
      button: "Únete a la lista",
    },
    {
      id: "max" as const,
      name: "Max",
      price: "Próximamente",
      soon: true,
      includes: [
        "Los cuatro agentes: Lola, Clara, Víctor e Iris",
        "Tú eliges tu equipo",
        "Muchos más mensajes al mes",
      ],
      button: "Únete a la lista",
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Posibles preguntas                                                  */
/* ------------------------------------------------------------------ */

export const FAQ = {
  label: "Preguntas",
  title: "Posibles preguntas",
  items: [
    {
      q: "¿Es difícil de usar?",
      a: "Entras con tu correo, sin contraseña, y les escribes a los agentes como le escribirías a alguien de tu equipo.",
    },
    {
      q: "¿Sirve para mi negocio?",
      a: "Si das servicio, trabajas con citas, recibes mensajes de clientes o vives de que regresen, sí. Empieza con Free y mira si te quita trabajo.",
    },
    {
      q: "¿Qué pasa si un agente se equivoca?",
      a: "Lo importante nunca sale sin tu visto bueno: tú apruebas antes de enviar. Y cuando un caso necesita a una persona, el agente te avisa.",
    },
    {
      q: "¿Los agentes contestan solos?",
      a: "Lola responde lo de todos los días: precios, horarios, formas de pago y citas. Cuando un caso necesita a una persona, te avisa.",
    },
    { q: "¿Necesito una contraseña?", a: "No. Escribes tu correo, te llega un enlace y entras." },
    {
      q: "¿Cuánto cuesta?",
      a: "Free es gratis e incluye a Clara. One y Max llegan pronto y todavía no tienen precio publicado. Si te unes a la lista, te avisamos.",
    },
    {
      q: "¿Puedo elegir qué agentes uso?",
      a: "Con Max eliges tu equipo entre los cuatro. Free incluye a Clara y One suma a Lola.",
    },
    {
      q: "¿Puedo verlo antes de unirme?",
      a: "Sí. En Pruébalo ves el panel y los chats con datos de ejemplo de Estudio Luna.",
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Lista de espera (cierre)                                            */
/* ------------------------------------------------------------------ */

export const WAITLIST_SECTION = {
  label: "Lista de espera",
  title: "Te avisamos cuando estén listos",
  text: "Deja tu correo y te escribimos cuando One y Max estén listos, con su precio. Mientras tanto puedes usar Free.",
};

/* ------------------------------------------------------------------ */
/* Contacto, entrar, 404                                               */
/* ------------------------------------------------------------------ */

export const CONTACT = {
  title: "Escríbenos",
  text: "Cuéntanos qué necesitas o qué te gustaría que hiciera un agente. Te respondemos por correo.",
  name: { label: "Nombre", placeholder: "Tu nombre" },
  email: { label: "Correo", placeholder: "tu@correo.com" },
  message: { label: "Mensaje", placeholder: "¿En qué te podemos ayudar?" },
  button: "Enviar mensaje",
  sending: "Enviando tu mensaje…",
  sendingShort: "Enviando…",
  doneShort: "Enviado",
  again: "Escribir otro mensaje",
  messages: {
    ok: "Mensaje enviado. Te respondemos por correo.",
    campos: "Falta algo. Revisa tu nombre, tu correo y el mensaje.",
    invalid: "Ese correo no se ve bien. Revísalo e intenta otra vez.",
    error: "No se pudo enviar. Intenta de nuevo en un momento.",
    unconfigured: "El formulario aún no está disponible. Vuelve pronto.",
  },
};

export const LOGIN = {
  title: "Entra con tu correo",
  text: "Sin contraseña. Escribe tu correo y te mandamos un enlace para entrar.",
  email: { label: "Correo", placeholder: "tu@correo.com" },
  button: "Enviarme el enlace",
  sending: "Enviando el enlace…",
  sendingShort: "Enviando…",
  sentTitle: "Revisa tu correo",
  sentBefore: "Te mandamos un enlace a ",
  sentAfter: ". Ábrelo en este mismo navegador para entrar. Si no lo ves, busca en spam.",
  other: "Usar otro correo",
  resend: "Reenviar el enlace",
  resent: "Te mandamos otro enlace.",
  invalid: "Ese correo no se ve bien. Revísalo e intenta otra vez.",
  error: "No pudimos enviar el enlace. Intenta de nuevo en un momento.",
  tooFast: "Ya te mandamos un enlace hace un momento. Espera un minuto e intenta de nuevo.",
  unconfigured: "Entrar aún no está disponible. Vuelve pronto.",
  unconfiguredMore: "Las cuentas todavía no abren. Mientras tanto puedes ver cómo funciona con datos de ejemplo.",
  expired: "Ese enlace ya no sirve. Pide uno nuevo con tu correo.",
  tryIt: "Probar con datos de ejemplo",
};

export const NOT_FOUND = {
  title: "Esta página no contestó",
  text: "Ni Lola la encontró, y eso que ella contesta a cualquier hora. Puede que el enlace esté mal escrito o que la página ya no exista.",
  home: "Volver al inicio",
  tryIt: "Pruébalo",
};
