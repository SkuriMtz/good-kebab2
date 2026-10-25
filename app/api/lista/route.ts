import { getServerSupabase } from "@/lib/supabase/server";
import { MAX_CORREO, YA_EXISTE, esCorreo, leerObjeto, limpiar, responder } from "./comun";

export const dynamic = "force-dynamic";

const PLANES = ["free", "one", "max"] as const;
type Plan = (typeof PLANES)[number];

/**
 * POST /api/lista  { email, plan?, origen? }
 *  200 { ok: true }                    · quedó anotado
 *  200 { ok: true, yaEstaba: true }    · ese correo ya estaba
 *  400 { error: "correo_invalido" }
 *  503 { error: "no_configurado" }
 *  500 { error: "error" }
 */
export async function POST(req: Request) {
  const cuerpo = await leerObjeto(req);
  if (!cuerpo) return responder({ error: "correo_invalido" }, 400);

  const email = limpiar(cuerpo.email, MAX_CORREO + 1).toLowerCase();
  if (!esCorreo(email)) return responder({ error: "correo_invalido" }, 400);

  const plan: Plan | null = PLANES.find((p) => p === cuerpo.plan) ?? null;
  const origen = limpiar(cuerpo.origen, 60) || null;

  const supabase = getServerSupabase();
  if (!supabase) return responder({ error: "no_configurado" }, 503);

  try {
    // Sin .select(): la tabla no se puede leer, solo escribir.
    const { error } = await supabase.from("waitlist").insert({ email, plan, origen });
    if (!error) return responder({ ok: true });
    if (error.code === YA_EXISTE) return responder({ ok: true, yaEstaba: true });
    return responder({ error: "error" }, 500);
  } catch {
    return responder({ error: "error" }, 500);
  }
}
