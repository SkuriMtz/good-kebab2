import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ChatFrame } from "@/components/chat/chat-frame";
import { allowedAgents } from "@/lib/chat/plan";
import { DEMO_GROUPS, DEMO_SUMMARIES, DEMO_USER } from "@/lib/demo/chat";

export const metadata: Metadata = {
  title: "Chat de ejemplo",
  description: "Prueba el chat con los agentes de Estudio Luna. Son datos de ejemplo y respuestas de guion, sin IA real.",
};

/** Chat de Pruébalo: lista lateral y conversaciones de Estudio Luna (datos de ejemplo, guion local). */
export default function DemoChatLayout({ children }: { children: ReactNode }) {
  return (
    <ChatFrame
      mode="demo"
      basePath="/pruebalo/chat"
      backHref="/pruebalo"
      userName={DEMO_USER.nombre}
      plan={DEMO_USER.plan}
      allowed={allowedAgents(DEMO_USER.plan)}
      conversations={DEMO_SUMMARIES}
      groups={DEMO_GROUPS}
    >
      {children}
    </ChatFrame>
  );
}
