/** Lectura central de variables de entorno. Las claves nunca van en el código. */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/** Solo en servidor. */
export function aiConfig() {
  return {
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    model: process.env.ATENDEL_AI_MODEL || "claude-sonnet-5-5",
  };
}
