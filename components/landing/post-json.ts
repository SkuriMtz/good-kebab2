export type PostResult =
  | { kind: "response"; status: number; data: Record<string, unknown> }
  | { kind: "network" };

/** POST con JSON. Nunca lanza: una red caída o una ruta que aún no existe son resultados. */
export async function postJson(url: string, body: unknown): Promise<PostResult> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    let data: Record<string, unknown> = {};
    try {
      const parsed = await res.json();
      if (parsed && typeof parsed === "object") data = parsed as Record<string, unknown>;
    } catch {
      // Respuesta sin JSON (por ejemplo, un 404 en HTML): se trata solo por su código.
    }
    return { kind: "response", status: res.status, data };
  } catch {
    return { kind: "network" };
  } finally {
    window.clearTimeout(timer);
  }
}
