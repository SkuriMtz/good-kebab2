import { getAgent, type AgentId, type PlanId } from "@/lib/agents";
import type { ResultCard } from "@/lib/db/types";
import { parseCommand, norm, workingStatus, type ChatCommand } from "@/lib/chat/commands";
import type { ChatMessage, ChatTarget, ConversationSummary, GroupSummary } from "@/lib/chat/types";

/**
 * Chat de ejemplo (Estudio Luna). Todo es un GUION LOCAL: no llama a la IA ni a la base.
 * Textos: docs/investigacion/textos.md §5 (guion) y §9 (datos de ejemplo y comandos).
 */

export const DEMO_USER = { nombre: "Ana", negocio: "Estudio Luna", plan: "max" as PlanId };
export const DEMO_NOTICE = "Datos de ejemplo de Estudio Luna. Nada de esto es real.";
export const DEMO_NO_SCRIPT = "Esto es una demostración con datos de ejemplo. Prueba con uno de los comandos con /.";

/* --------------------------------- Grupos --------------------------------- */

export const DEMO_GROUPS: GroupSummary[] = [
  {
    id: "recepcion",
    nombre: "Recepción",
    agentes: ["lola", "clara"],
    descripcion: "Atienden tus mensajes y tu correo en un mismo lugar.",
    hilo: "grupo-recepcion",
  },
  {
    id: "seguimiento",
    nombre: "Seguimiento",
    agentes: ["victor", "iris"],
    descripcion: "Traen de regreso a tus clientes y preparan tus reportes.",
    hilo: "grupo-seguimiento",
  },
];

/* ---------------------------- Conversaciones ---------------------------- */

const T0 = "2026-10-22T";
const msg = (
  id: string,
  rol: ChatMessage["rol"],
  agente: AgentId | null,
  contenido: string,
  hora: string,
  extra: Partial<ChatMessage> = {},
): ChatMessage => ({ id, rol, agente, contenido, tarjeta: null, created_at: `${T0}12:00:00Z`, hora, ...extra });

const MARTA = "Marta";

/** El guion de textos.md §5 (10 mensajes, con su tarjeta de cita y su aviso). */
const GUION_CITA: ChatMessage[] = [
  msg("c0", "sistema", null, "Lola atendió este WhatsApp por ti", "9:41 pm"),
  msg("c1", "usuario", null, "Hola, buenas noches. ¿Cuánto cuesta la sesión de 1 hora?", "9:41 pm", { autor: MARTA }),
  msg(
    "c2",
    "agente",
    "lola",
    "Hola, Marta, buenas noches. Soy Lola, la asistente de Estudio Luna. La sesión de 1 hora cuesta $450.",
    "9:41 pm",
    { nota: "Precio de ejemplo. Lola usa el que tú definas." },
  ),
  msg("c3", "usuario", null, "¿Hasta qué hora atienden?", "9:42 pm", { autor: MARTA }),
  msg("c4", "agente", "lola", "De lunes a sábado, de 10:00 am a 7:00 pm.", "9:42 pm"),
  msg("c5", "usuario", null, "¿Tienen lugar este jueves?", "9:42 pm", { autor: MARTA }),
  msg("c6", "agente", "lola", "Sí. El jueves tengo 11:00 am, 3:00 pm y 5:00 pm. ¿Cuál te acomoda?", "9:42 pm"),
  msg("c7", "usuario", null, "A las 5:00 pm, por favor.", "9:43 pm", { autor: MARTA }),
  msg(
    "c8",
    "agente",
    "lola",
    "Listo, Marta. Te agendé una sesión de 1 hora el jueves a las 5:00 pm. Antes de la cita te mando un recordatorio.",
    "9:43 pm",
    { tarjeta: { tipo: "cita", titulo: "Cita agendada", detalle: "Jueves, 5:00 pm · Sesión de 1 hora" } },
  ),
  msg("c9", "usuario", null, "Gracias. ¿Y si llevo a una amiga, me hacen descuento?", "9:44 pm", { autor: MARTA }),
  msg(
    "c10",
    "agente",
    "lola",
    "Eso lo decide Ana y no quiero prometerte algo que no sé. Ya le avisé; te responde en cuanto pueda.",
    "9:44 pm",
    {
      tarjeta: {
        tipo: "aviso",
        titulo: "Lola le avisó a Ana",
        detalle:
          "Marta, con cita el jueves a las 5:00 pm, pregunta si hay descuento al llevar a una amiga. Este caso necesita a una persona.",
      },
    },
  ),
];

/** Sugerencias que aparecen tras el mensaje 10 (textos.md §5). */
export const DEMO_SUGGESTIONS: { texto: string; respuesta: string }[] = [
  {
    texto: "¿Puedo pagar con tarjeta?",
    respuesta:
      "Sí, aquí se acepta tarjeta, transferencia y efectivo. Son las formas de pago que Ana dejó configuradas.",
  },
  {
    texto: "Quiero cambiar mi cita",
    respuesta:
      "Claro. Tu sesión es el jueves a las 5:00 pm. Tengo el viernes a las 11:00 am o el sábado a las 3:00 pm. Cuando elijas, la muevo y le aviso a Ana.",
  },
  {
    texto: "¿Qué haces si no sabes algo?",
    respuesta: "Te lo digo y le aviso a Ana. No invento respuestas ni prometo lo que no me toca.",
  },
];

/** Conversación que abre el guion con sugerencias. */
export const DEMO_GUION_ID = "cita-del-jueves";

const CARD_FACTURA: ResultCard = {
  tipo: "correo",
  titulo: "Factura que vence el viernes",
  detalle: "Dejé una respuesta lista para que la revises.",
  accion: "Aprobar y enviar",
  pendiente: true,
};
const CARD_CLIENTES: ResultCard = {
  tipo: "aviso",
  titulo: "Mensaje para clientes que no vienen hace tiempo",
  detalle: "Un mensaje personal para cada cliente. No se manda nada hasta que lo apruebes.",
  accion: "Aprobar y enviar",
  pendiente: true,
};
const CARD_REPORTE: ResultCard = {
  tipo: "archivo",
  titulo: "Reporte del mes (borrador)",
  detalle: "Resumen de Estudio Luna. No sale hasta que lo apruebes.",
  accion: "Aprobar y enviar",
  pendiente: true,
};
const CARD_CITA_VIERNES: ResultCard = {
  tipo: "cita",
  titulo: "Cita propuesta",
  detalle: "Viernes, 11:00 am · Sesión de 1 hora",
  accion: "Aprobar y enviar",
  pendiente: true,
};

type DemoConversation = ConversationSummary & { mensajes: ChatMessage[] };

export const DEMO_CONVERSATIONS: DemoConversation[] = [
  {
    id: DEMO_GUION_ID,
    titulo: "Cita del jueves",
    tipo: "agente",
    agentes: ["lola"],
    grupo_id: null,
    ultimo: "Listo, Marta. Te agendé el jueves a las 5:00 pm.",
    updated_at: `${T0}21:44:00Z`,
    mensajes: GUION_CITA,
  },
  {
    id: "correo-de-hoy",
    titulo: "Correo de hoy",
    tipo: "agente",
    agentes: ["clara"],
    grupo_id: null,
    ultimo: "Hay una factura que vence el viernes.",
    updated_at: `${T0}20:30:00Z`,
    mensajes: [
      msg("k1", "usuario", null, "¿Qué llegó hoy a mi correo?", "10:14 am"),
      msg(
        "k2",
        "agente",
        "clara",
        "Revisé el correo de la mañana y lo ordené por urgencia. Hay una factura que vence el viernes. Lo demás puede esperar.",
        "10:15 am",
        { tarjeta: CARD_FACTURA },
      ),
    ],
  },
  {
    id: "clientes-que-no-han-vuelto",
    titulo: "Clientes que no han vuelto",
    tipo: "agente",
    agentes: ["victor"],
    grupo_id: null,
    ultimo: "Dejé el mensaje listo para que lo apruebes.",
    updated_at: `${T0}19:30:00Z`,
    mensajes: [
      msg("v1", "usuario", null, "Busca a los clientes que ya no vienen y escríbeles.", "10:46 am"),
      msg(
        "v2",
        "agente",
        "victor",
        "Dejé el mensaje listo para que lo apruebes. Es personal y corto. No sale hasta que tú lo digas.",
        "10:48 am",
        { tarjeta: CARD_CLIENTES },
      ),
    ],
  },
  {
    id: "reporte-del-mes",
    titulo: "Reporte del mes",
    tipo: "agente",
    agentes: ["iris"],
    grupo_id: null,
    ultimo: "Ya está el borrador. ¿Lo revisas?",
    updated_at: `${T0}18:30:00Z`,
    mensajes: [
      msg("r1", "usuario", null, "/reporte", "11:03 am"),
      msg("r2", "agente", "iris", "Ya está el borrador. ¿Lo revisas?", "11:05 am", { tarjeta: CARD_REPORTE }),
    ],
  },
  {
    id: "cambiar-una-cita",
    titulo: "Cambiar una cita",
    tipo: "agente",
    agentes: ["lola"],
    grupo_id: null,
    ultimo: "Te propongo el viernes a las 11:00 am.",
    updated_at: `${T0}17:30:00Z`,
    mensajes: [
      msg("a1", "usuario", null, "/agendar mover la cita de Marta", "9:56 am"),
      msg("a2", "agente", "lola", "Te propongo el viernes a las 11:00 am.", "9:58 am", { tarjeta: CARD_CITA_VIERNES }),
    ],
  },
];

/** Conversaciones de grupo ya hechas (se abren desde la sección Grupos). */
export const DEMO_GROUP_THREADS: (ConversationSummary & { mensajes: ChatMessage[] })[] = [
  {
    id: "grupo-recepcion",
    titulo: "Recepción",
    tipo: "grupo",
    agentes: ["lola", "clara"],
    grupo_id: "recepcion",
    ultimo: "Hay una factura que vence el viernes.",
    updated_at: `${T0}08:41:00Z`,
    mensajes: [
      msg("gr1", "usuario", null, "Revisen mis mensajes y mi correo de hoy.", "8:38 am"),
      msg(
        "gr2",
        "agente",
        "lola",
        "Primero los mensajes de tus clientes. Un cliente preguntó por un descuento y eso lo decides tú, así que te lo marqué.",
        "8:39 am",
      ),
      msg("gr3", "sistema", null, "Lola le pasó esto a Clara", "8:40 am"),
      msg("gr4", "agente", "clara", "Yo sigo con el correo. Hay una factura que vence el viernes.", "8:41 am", {
        tarjeta: CARD_FACTURA,
      }),
    ],
  },
  {
    id: "grupo-seguimiento",
    titulo: "Seguimiento",
    tipo: "grupo",
    agentes: ["victor", "iris"],
    grupo_id: "seguimiento",
    ultimo: "Ya está el borrador. ¿Lo revisas?",
    updated_at: `${T0}08:11:00Z`,
    mensajes: [
      msg("gs1", "usuario", null, "Prepárenme el seguimiento del mes.", "8:05 am"),
      msg(
        "gs2",
        "agente",
        "victor",
        "Preparé una petición de reseña para quien tuvo su primera visita y el mensaje para quienes no han vuelto. Nada sale sin tu visto bueno.",
        "8:08 am",
      ),
      msg("gs3", "sistema", null, "Víctor le pasó esto a Iris", "8:09 am"),
      msg("gs4", "agente", "iris", "Ya está el borrador. ¿Lo revisas?", "8:11 am", { tarjeta: CARD_REPORTE }),
    ],
  },
];

export const DEMO_SUMMARIES: ConversationSummary[] = DEMO_CONVERSATIONS.map(({ mensajes: _m, ...resumen }) => resumen);
export const DEMO_GROUP_SUMMARIES: ConversationSummary[] = DEMO_GROUP_THREADS.map(({ mensajes: _m, ...resumen }) => resumen);

export function getDemoThread(id: string): { resumen: ConversationSummary; mensajes: ChatMessage[] } | null {
  const c = [...DEMO_CONVERSATIONS, ...DEMO_GROUP_THREADS].find((x) => x.id === id);
  if (!c) return null;
  const { mensajes, ...resumen } = c;
  return { resumen, mensajes };
}

export const DEMO_THREAD_IDS = [...DEMO_CONVERSATIONS, ...DEMO_GROUP_THREADS].map((c) => c.id);

/* --------------------------- Respuestas con guion --------------------------- */

export type DemoStep =
  | { t: "estado"; agente: AgentId; texto: string; ms: number }
  | { t: "escribiendo"; agente: AgentId; ms: number }
  | { t: "mensaje"; agente: AgentId; contenido: string; tarjeta?: ResultCard; nota?: string }
  | { t: "sistema"; contenido: string; ms: number };

type Reply = { contenido: string; tarjeta?: ResultCard; nota?: string };

const has = (texto: string, re: RegExp) => re.test(norm(texto));

function replyLola(texto: string, cmd: ChatCommand | null, resto: string): Reply {
  if (cmd?.id === "agendar") {
    return {
      contenido: resto
        ? "Listo, preparé la cita con lo que me diste. Revísala y, si te parece bien, la agendo y le aviso a tu cliente."
        : "Listo, preparé la cita. Dime el día y la hora y la dejo lista para que la apruebes.",
      tarjeta: {
        tipo: "cita",
        titulo: "Cita por agendar",
        detalle: resto || "Sesión de 1 hora · falta elegir día y hora",
        accion: "Aprobar y enviar",
        pendiente: true,
      },
    };
  }
  if (cmd?.id === "recordar") {
    return {
      contenido: resto
        ? "Listo, preparé el aviso con lo que me diste. Revísalo y, si te parece bien, lo dejo programado."
        : "Claro. Dime qué quieres recordar y para cuándo, y dejo el aviso listo para que lo apruebes.",
      tarjeta: {
        tipo: "aviso",
        titulo: "Aviso por programar",
        detalle: resto || "Falta decir qué recordar y para cuándo.",
        accion: "Aprobar y programar",
        pendiente: true,
      },
    };
  }
  if (has(texto, /precio|cuesta|cobr/)) {
    return { contenido: "La sesión de 1 hora cuesta $450.", nota: "Precio de ejemplo. Lola usa el que tú definas." };
  }
  if (has(texto, /horario|hora|abren|atienden/)) {
    return {
      contenido: "De lunes a sábado, de 10:00 am a 7:00 pm.",
      nota: "Horario de ejemplo. Lola usa el que tú definas.",
    };
  }
  if (has(texto, /pago|tarjeta|efectivo|transferencia/)) {
    return { contenido: "Aceptas tarjeta, transferencia y efectivo. Son las formas de pago que dejaste configuradas." };
  }
  if (has(texto, /descuento/)) {
    return {
      contenido:
        "Eso lo decides tú. No doy descuentos ni cambio precios por mi cuenta. Si quieres, te dejo una respuesta lista para que la apruebes.",
    };
  }
  if (has(texto, /cita|agenda|mover|cambiar|reagend/)) {
    return { contenido: "Te propongo el viernes a las 11:00 am. Si te late, la agendo y aviso a tu cliente.", tarjeta: CARD_CITA_VIERNES };
  }
  return { contenido: `${DEMO_NO_SCRIPT} Con Lola puedes usar /agendar o /recordar.` };
}

function replyClara(texto: string, cmd: ChatCommand | null, resto: string): Reply {
  if (cmd?.id === "resumir" || has(texto, /correo|factura|urgente|resum/)) {
    return {
      contenido: resto
        ? "Resumí lo que me pasaste y marqué lo urgente. Lo primero: hay una fecha límite el viernes."
        : "Resumí tu correo de hoy y lo ordené por urgencia. Lo primero: hay una factura que vence el viernes. Lo demás puede esperar.",
      tarjeta: CARD_FACTURA,
    };
  }
  return { contenido: `${DEMO_NO_SCRIPT} Con Clara puedes usar /resumir.` };
}

function replyVictor(texto: string): Reply {
  if (has(texto, /cliente|regres|volver|seguimiento|resena|vienen/)) {
    return {
      contenido:
        "Encontré clientes que no vienen hace tiempo y les redacté un mensaje personal. No sale nada hasta que lo apruebes.",
      tarjeta: CARD_CLIENTES,
    };
  }
  return { contenido: `${DEMO_NO_SCRIPT} Pídele a Víctor que busque a los clientes que no han vuelto.` };
}

function replyIris(texto: string, cmd: ChatCommand | null, resto: string): Reply {
  if (cmd?.id === "reporte" || has(texto, /reporte|informe/)) {
    return { contenido: "Ya está el borrador. ¿Lo revisas?", tarjeta: CARD_REPORTE };
  }
  if (cmd?.id === "redactar" || has(texto, /redact|carta|escribe/)) {
    return {
      contenido: resto
        ? "Aquí va un primer borrador con lo que me diste. Dime si lo quieres más corto o más cálido y lo ajusto antes de que lo envíes."
        : "Aquí va un primer borrador. Dime si lo quieres más corto o más cálido y lo ajusto antes de que lo envíes.",
      tarjeta: {
        tipo: "archivo",
        titulo: "Borrador de carta",
        detalle: resto || "Falta el nombre de quien la recibe.",
        accion: "Aprobar y enviar",
        pendiente: true,
      },
    };
  }
  if (cmd?.id === "investigar" || has(texto, /compar|proveedor|precio/)) {
    return {
      contenido:
        "En esta demostración no consulto proveedores reales. Con tu cuenta, me pasas los datos y te armo la comparación con precios y condiciones.",
      tarjeta: { tipo: "archivo", titulo: "Comparativo de ejemplo", detalle: "Sin datos reales.", accion: "Abrir comparativo" },
    };
  }
  return { contenido: `${DEMO_NO_SCRIPT} Con Iris puedes usar /redactar, /investigar o /reporte.` };
}

function replyFor(agent: AgentId, texto: string, cmd: ChatCommand | null, resto: string): Reply {
  switch (agent) {
    case "lola":
      return replyLola(texto, cmd, resto);
    case "clara":
      return replyClara(texto, cmd, resto);
    case "victor":
      return replyVictor(texto);
    case "iris":
      return replyIris(texto, cmd, resto);
  }
}

/** Qué dice cada agente de un grupo (en orden) cuando llega un pedido. */
function groupReplies(group: GroupSummary): Reply[] {
  if (group.id === "recepcion") {
    return [
      {
        contenido:
          "Primero van los mensajes de tus clientes. Lo que necesita a una persona te lo marco y lo demás lo dejo atendido.",
      },
      { contenido: "Yo sigo con el correo. Hay una factura que vence el viernes.", tarjeta: CARD_FACTURA },
    ];
  }
  if (group.id === "seguimiento") {
    return [
      {
        contenido:
          "Busco a quien no ha vuelto y preparo un mensaje personal. No sale nada sin tu visto bueno.",
        tarjeta: CARD_CLIENTES,
      },
      { contenido: "Con eso armé el borrador del reporte del mes. ¿Lo revisas?", tarjeta: CARD_REPORTE },
    ];
  }
  return group.agentes.map((a) => ({
    contenido: `${getAgent(a).name} ya recibió tu pedido y hace su parte. ${DEMO_NO_SCRIPT}`,
  }));
}

/**
 * Pasos de la respuesta a un mensaje: estado → "escribiendo…" → mensaje (con tarjeta),
 * y en grupos, la línea de sistema entre un agente y otro.
 */
export function planDemoReply(input: {
  texto: string;
  target: ChatTarget;
  groups: GroupSummary[];
  /** Si el mensaje es una sugerencia del guion, su respuesta exacta. */
  respuestaFija?: string;
}): DemoStep[] {
  const { texto, target, groups } = input;
  const parsed = parseCommand(texto);
  const cmd = parsed?.command ?? null;
  const resto = parsed?.resto ?? "";

  if (input.respuestaFija) {
    return [
      { t: "estado", agente: "lola", texto: workingStatus("lola"), ms: 900 },
      { t: "escribiendo", agente: "lola", ms: 800 },
      { t: "mensaje", agente: "lola", contenido: input.respuestaFija },
    ];
  }

  if (target.kind === "grupo") {
    const group = groups.find((g) => g.id === target.groupId);
    if (group) {
      const replies = groupReplies(group);
      const steps: DemoStep[] = [];
      group.agentes.forEach((agente, i) => {
        if (i > 0) {
          steps.push({
            t: "sistema",
            contenido: `${getAgent(group.agentes[i - 1]).name} le pasó esto a ${getAgent(agente).name}`,
            ms: 700,
          });
        }
        steps.push({ t: "estado", agente, texto: workingStatus(agente), ms: 1000 });
        steps.push({ t: "escribiendo", agente, ms: 800 });
        const r = replies[i] ?? { contenido: DEMO_NO_SCRIPT };
        steps.push({ t: "mensaje", agente, contenido: r.contenido, tarjeta: r.tarjeta, nota: r.nota });
      });
      return steps;
    }
  }

  const agente: AgentId = cmd ? cmd.agent : target.kind === "agente" ? target.agent : "lola";
  const r = replyFor(agente, texto, cmd, resto);
  return [
    { t: "estado", agente, texto: workingStatus(agente, cmd), ms: 1100 },
    { t: "escribiendo", agente, ms: 900 },
    { t: "mensaje", agente, contenido: r.contenido, tarjeta: r.tarjeta, nota: r.nota },
  ];
}

