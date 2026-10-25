"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import type { AgentId, PlanId } from "@/lib/agents";
import { Sheet } from "@/components/ui/sheet";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { deleteConversation } from "@/lib/db/chat";
import type { ChatMessage, ChatMode, ConversationSummary, GroupSummary } from "@/lib/chat/types";
import { ChatProvider, type ChatContextValue } from "./chat-context";
import { ConversationList } from "./conversation-list";
import { UndoToast } from "./undo-toast";

type Props = {
  mode: ChatMode;
  basePath: string;
  backHref: string;
  userName: string | null;
  plan: PlanId;
  allowed: AgentId[];
  conversations: ConversationSummary[];
  groups: GroupSummary[];
  children: ReactNode;
};

const UNDO_MS = 6000;

/**
 * Marco del chat: lista lateral a la izquierda (en computadora) o en un Sheet (celular),
 * y la conversación a la derecha. Vive en el layout, así que la lista no se reinicia al cambiar de chat.
 */
export function ChatFrame({ mode, basePath, backHref, userName, plan, allowed, conversations: fromServer, groups: groupsFromServer, children }: Props) {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const activeId = typeof params?.id === "string" ? params.id : null;

  const [sheet, setSheet] = useState(false);
  const [removed, setRemoved] = useState<string[]>([]);
  const [local, setLocal] = useState<ConversationSummary[]>([]);
  const [localGroups, setLocalGroups] = useState<GroupSummary[]>([]);
  const [toast, setToast] = useState<{ id: string; titulo: string } | null>(null);
  const threads = useRef(new Map<string, ChatMessage[]>());
  const pending = useRef(new Map<string, number>());

  // En vivo, lo que llega del servidor manda: se sueltan los cambios locales.
  useEffect(() => {
    if (mode === "live") {
      setLocal([]);
      setLocalGroups([]);
    }
  }, [fromServer, groupsFromServer, mode]);

  const conversations = useMemo(() => {
    const map = new Map<string, ConversationSummary>();
    fromServer.forEach((c) => map.set(c.id, c));
    local.forEach((c) => map.set(c.id, c));
    return Array.from(map.values())
      .filter((c) => !removed.includes(c.id))
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }, [fromServer, local, removed]);

  const groups = useMemo(() => {
    const ids = new Set(groupsFromServer.map((g) => g.id));
    return [...groupsFromServer, ...localGroups.filter((g) => !ids.has(g.id))];
  }, [groupsFromServer, localGroups]);

  const commit = useCallback(
    (id: string) => {
      const timer = pending.current.get(id);
      if (timer === undefined) return;
      window.clearTimeout(timer);
      pending.current.delete(id);
      setToast((t) => (t && t.id === id ? null : t));
      if (mode === "live") {
        const sb = getBrowserSupabase();
        if (sb) void deleteConversation(sb, id).then(() => router.refresh());
      }
    },
    [mode, router],
  );

  const removeConversation = useCallback(
    (id: string) => {
      const c = conversations.find((x) => x.id === id);
      if (!c) return;
      Array.from(pending.current.keys()).forEach(commit);
      setRemoved((r) => [...r, id]);
      setToast({ id, titulo: c.titulo });
      pending.current.set(id, window.setTimeout(() => commit(id), UNDO_MS));
      if (activeId === id) router.replace(basePath);
    },
    [activeId, basePath, commit, conversations, router],
  );

  const undo = useCallback((id: string) => {
    const timer = pending.current.get(id);
    if (timer !== undefined) window.clearTimeout(timer);
    pending.current.delete(id);
    setRemoved((r) => r.filter((x) => x !== id));
    setToast(null);
  }, []);

  // Si se cierra la pestaña con un borrado pendiente, se confirma.
  useEffect(() => {
    const flush = () => Array.from(pending.current.keys()).forEach(commit);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [commit]);

  const value = useMemo<ChatContextValue>(
    () => ({
      mode,
      basePath,
      backHref,
      userName,
      plan,
      allowed,
      conversations,
      groups,
      activeId,
      openList: () => setSheet(true),
      upsertConversation: (c) =>
        setLocal((l) => [...l.filter((x) => x.id !== c.id), c]),
      removeConversation,
      addGroup: (g) => setLocalGroups((l) => [...l.filter((x) => x.id !== g.id), g]),
      getThread: (id) => threads.current.get(id),
      setThread: (id, messages) => {
        threads.current.set(id, messages);
      },
      refreshList: () => {
        if (mode === "live") router.refresh();
      },
    }),
    [mode, basePath, backHref, userName, plan, allowed, conversations, groups, activeId, removeConversation, router],
  );

  return (
    <ChatProvider value={value}>
      <div className="flex h-[calc(100dvh-var(--chat-top,0px))] w-full overflow-hidden bg-chat-bg text-chat-fg">
        <aside
          aria-label="Conversaciones"
          className="hidden w-[340px] shrink-0 flex-col bg-chat-panel [view-transition-name:app-side] lg:flex xl:w-[368px]"
        >
          <ConversationList />
        </aside>
        <main id="contenido" className="relative flex min-w-0 flex-1 flex-col">
          {children}
        </main>
      </div>

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Conversaciones" side="auto" className="light:bg-chat-panel">
        <ConversationList onNavigate={() => setSheet(false)} compact />
      </Sheet>

      <UndoToast toast={toast} onUndo={undo} />
    </ChatProvider>
  );
}
