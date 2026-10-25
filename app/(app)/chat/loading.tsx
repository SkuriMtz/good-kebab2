import { Spinner } from "@/components/ui/spinner";

/** Mientras llega la conversación: la lista lateral se queda y aquí solo hay un indicador discreto. */
export default function ChatLoading() {
  return (
    <div role="status" className="flex flex-1 items-center justify-center gap-3 text-chat-fg-2">
      <Spinner />
      <span className="text-[0.9375rem]">Cargando tu conversación…</span>
    </div>
  );
}
