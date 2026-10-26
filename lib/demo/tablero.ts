import type { TableroData } from "@/components/dashboard/types";
import { agentesDisponibles } from "@/components/dashboard/plan";

/**
 * Datos de ejemplo de Estudio Luna (textos.md §9) para /pruebalo.
 * Dueña: Ana. Plan Max. Nada de esto es real y la pantalla lo dice.
 */
export const TABLERO_DEMO: TableroData = {
  base: "/pruebalo",
  demo: true,
  nombre: "Ana",
  negocio: "Estudio Luna",
  email: null,
  plan: "max",
  disponibles: agentesDisponibles("max"),
  usados: 132,
  // Sin tope: los mensajes de cada plan no están definidos y el ejemplo no inventa una cifra.
  limite: null,
  actividad: [
    {
      id: "a1",
      agente: "iris",
      accion: "Armó el borrador del reporte del mes",
      estado: "espera",
      hora: "11:05 am",
      dia: "Hoy",
    },
    {
      id: "a2",
      agente: "victor",
      accion: "Redactó un mensaje para clientes que no vienen hace tiempo",
      estado: "espera",
      hora: "10:48 am",
      dia: "Hoy",
    },
    {
      id: "a3",
      agente: "clara",
      accion: "Detectó una factura que vence el viernes",
      estado: "listo",
      hora: "10:15 am",
      dia: "Hoy",
    },
    {
      id: "a4",
      agente: "lola",
      accion: "Reagendó una sesión de 1 hora para el viernes a las 11:00 am",
      estado: "listo",
      hora: "9:58 am",
      dia: "Hoy",
    },
    {
      id: "a5",
      agente: "lola",
      accion: "Avisó a Ana que un cliente pidió un descuento",
      estado: "aviso",
      hora: "9:31 am",
      dia: "Hoy",
    },
    {
      id: "a6",
      agente: "clara",
      accion: "Resumió el correo de la mañana y lo ordenó por urgencia",
      estado: "listo",
      hora: "9:12 am",
      dia: "Hoy",
    },
    {
      id: "a7",
      agente: "lola",
      accion: "Contestó por WhatsApp una duda sobre formas de pago",
      estado: "listo",
      hora: "8:40 am",
      dia: "Hoy",
    },
    {
      id: "a8",
      agente: "victor",
      accion: "Preparó una petición de reseña tras una primera visita",
      estado: "listo",
      estadoTexto: "Aprobado por Ana",
      detalle: null,
      hora: "8:05 am",
      dia: "Hoy",
    },
  ],
  grupos: [
    {
      id: "recepcion",
      hilo: "grupo-recepcion",
      nombre: "Recepción",
      agentes: ["lola", "clara"],
      descripcion: "Atienden tus mensajes y tu correo en un mismo lugar.",
    },
    {
      id: "seguimiento",
      hilo: "grupo-seguimiento",
      nombre: "Seguimiento",
      agentes: ["victor", "iris"],
      descripcion: "Traen de regreso a tus clientes y preparan tus reportes.",
    },
  ],
  conversaciones: [
    {
      id: "cita-del-jueves",
      titulo: "Cita del jueves",
      agentes: ["lola"],
      tipo: "agente",
      ultimo: "Listo, Marta. Te agendé el jueves a las 5:00 pm.",
    },
    {
      id: "correo-de-hoy",
      titulo: "Correo de hoy",
      agentes: ["clara"],
      tipo: "agente",
      ultimo: "Hay una factura que vence el viernes.",
    },
    {
      id: "clientes-que-no-han-vuelto",
      titulo: "Clientes que no han vuelto",
      agentes: ["victor"],
      tipo: "agente",
      ultimo: "Dejé el mensaje listo para que lo apruebes.",
    },
    {
      id: "reporte-del-mes",
      titulo: "Reporte del mes",
      agentes: ["iris"],
      tipo: "agente",
      ultimo: "Ya está el borrador. ¿Lo revisas?",
    },
    {
      id: "cambiar-una-cita",
      titulo: "Cambiar una cita",
      agentes: ["lola"],
      tipo: "agente",
      ultimo: "Te propongo el viernes a las 11:00 am.",
    },
  ],
};
