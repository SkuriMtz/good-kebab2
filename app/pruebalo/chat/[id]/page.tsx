import { ChatThread } from "@/components/chat/chat-thread";
import { DEMO_THREAD_IDS, getDemoThread } from "@/lib/demo/chat";

export function generateStaticParams() {
  return DEMO_THREAD_IDS.map((id) => ({ id }));
}

/** /pruebalo/chat/[id]: una conversación de ejemplo. Si el id es de una conversación creada en esta visita, el cliente la recupera de memoria. */
export default function DemoChatThreadPage({ params }: { params: { id: string } }) {
  const hilo = getDemoThread(params.id);
  return (
    <ChatThread
      key={params.id}
      conversationId={params.id}
      conversation={hilo?.resumen ?? null}
      initialMessages={hilo?.mensajes ?? []}
    />
  );
}
