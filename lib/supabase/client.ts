"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/env";

/** Cliente para el navegador. Devuelve null si Supabase no está configurado. */
export function getBrowserSupabase() {
  if (!isSupabaseConfigured()) return null;
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
