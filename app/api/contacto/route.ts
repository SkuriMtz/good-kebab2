import { getServerSupabase } from "@/lib/supabase/server";
import { MAX_CORREO, YA_EXISTE, esCorreo, leerObjeto, limpiar, responder } from "../lista/comun";

export const dynamic = "force-dynamic";

const MAX_NOMBRE = 120;
const MAX_MENSAJE = 4000;

/**
 * POST /api/contacto  { nombre, email, mensaje }
 *  200 { ok: true }
 *  200 { ok: true, yaEstaba: true }    · (solo si la base marca el registro como repetido)
 *  400 { error: "campos" }             · falta algo
 *  400 { error: "correo_invalido" }
 *  503 { error: "no_configurado" }
 *  500 { error: "error" }
 */
export async function POST(req: Request) {
  const cuerpo = await leerObjeto(req);
  if (!cuerpo) return responder({ error: "campos" }, 400);

  const nombre = limpiar(cuerpo.nombre, MAX_NOMBRE);
  const email = limpiar(cuerpo.email, MAX_CORREO + 1).toLowerCase();
  const mensaje = limpiar(cuerpo.mensaje, MAX_MENSAJE, true);

  if (!nombre || !email || !mensaje) return responder({ error: "campos" }, 400);
  if (!esCorreo(email)) return responder({ error: "correo_invalido" }, 400);

  const supabase = getServerSupabase();
  if (!supabase) return responder({ error: "no_configurado" }, 503);

  try {
    const { error } = await supabase.from("contact_messages").insert({ nombre, email, mensaje });
    if (!error) return responder({ ok: true });
    if (error.code === YA_EXISTE) return responder({ ok: true, yaEstaba: true });
    return responder({ error: "error" }, 500);
  } catch {
    return responder({ error: "error" }, 500);
  }
}
