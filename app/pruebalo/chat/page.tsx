import { ChatThread } from "@/components/chat/chat-thread";

/** /pruebalo/chat: sin conversación abierta (saludo y caja de escribir). */
export default function DemoChatPage() {
  return <ChatThread conversationId={null} conversation={null} initialMessages={[]} />;
}
