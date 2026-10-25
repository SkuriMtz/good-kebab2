import { ChatThread } from "@/components/chat/chat-thread";

/** /chat: sin conversación abierta (saludo y caja de escribir). */
export default function ChatPage() {
  return <ChatThread conversationId={null} conversation={null} initialMessages={[]} />;
}
