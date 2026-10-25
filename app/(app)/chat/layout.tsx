import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { ChatFrame } from "@/components/chat/chat-frame";
import { ChatSkeleton } from "@/components/chat/chat-skeleton";
import { getChatUser, listConversations, listGrupos } from "@/lib/db/chat";
import { allowedAgents } from "@/lib/chat/plan";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Chat",
  robots: { index: false, follow: false },
};

/** Chat en vivo: pide sesión, carga tu plan, tus conversaciones y tus grupos. */
async function ChatData({ children }: { children: ReactNode }) {
  const sb = getServerSupabase();
  if (!sb) redirect("/entrar?error=no_configurado");
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/entrar");

  const [perfil, conversations, groups] = await Promise.all([getChatUser(sb, user.id), listConversations(sb), listGrupos(sb)]);

  return (
    <ChatFrame
      mode="live"
      basePath="/chat"
      backHref="/panel"
      userName={perfil.nombre}
      plan={perfil.plan}
      allowed={allowedAgents(perfil.plan, perfil.equipo)}
      conversations={conversations}
      groups={groups}
    >
      {children}
    </ChatFrame>
  );
}

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <ChatData>{children}</ChatData>
    </Suspense>
  );
}
