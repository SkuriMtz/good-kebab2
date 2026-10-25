import { Spinner } from "@/components/ui/spinner";

/** Lo que se ve mientras llegan tu plan, tus conversaciones y tus grupos: el lienzo del chat, sin saltos. */
export function ChatSkeleton() {
  return (
    <div className="flex h-[calc(100dvh-var(--chat-top,0px))] w-full bg-chat-bg text-chat-fg">
      <div className="hidden w-[340px] shrink-0 bg-chat-panel lg:block xl:w-[368px]" aria-hidden="true" />
      <div role="status" className="flex flex-1 items-center justify-center gap-3 text-chat-fg-2">
        <Spinner />
        <span className="text-[0.9375rem]">Abriendo tu chat…</span>
      </div>
    </div>
  );
}
