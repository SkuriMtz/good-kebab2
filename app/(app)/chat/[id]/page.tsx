import { notFound, redirect } from "next/navigation";
import { ChatThread } from "@/components/chat/chat-thread";
import { getConversation, listMessages } from "@/lib/db/chat";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** /chat/[id]: una conversación tuya, con sus mensajes. */
export default async function ChatThreadPage({ params }: { params: { id: string } }) {
  const sb = getServerSupabase();
  if (!sb) redirect("/entrar?error=no_configurado");
  const [conversation, messages] = await Promise.all([getConversation(sb, params.id), listMessages(sb, params.id)]);
  if (!conversation) notFound();
  return <ChatThread key={params.id} conversationId={params.id} conversation={conversation} initialMessages={messages} />;
}
