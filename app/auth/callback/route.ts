import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getServerSupabase } from "@/lib/supabase/server";
import { destinoSeguro } from "../destino";

export const dynamic = "force-dynamic";

const TIPOS: ReadonlySet<string> = new Set(["signup", "invite", "magiclink", "recovery", "email_change", "email"]);

/**
 * Entrada con el enlace del correo. Acepta los dos formatos:
 *  - `token_hash` + `type` (el de la plantilla de Atendel; sirve aunque abran el
 *    correo en otro navegador o en el visor del celular),
 *  - `code` (flujo PKCE; solo sirve en el mismo navegador que pidió el enlace).
 * Después manda a `next` (solo rutas internas) o a /panel.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const aqui = (ruta: string) => NextResponse.redirect(new URL(ruta, req.nextUrl.origin));

  const supabase = getServerSupabase();
  if (!supabase) return aqui("/entrar?error=no_configurado");

  const code = q.get("code");
  const tokenHash = q.get("token_hash");
  const tipo = q.get("type");
  const destino = destinoSeguro(q.get("next"));

  // Supabase manda ?error=... cuando el enlace venció o ya se usó.
  if (q.get("error") || q.get("error_code")) return aqui("/entrar?error=enlace");

  try {
    if (tokenHash) {
      const type = (tipo && TIPOS.has(tipo) ? tipo : "email") as EmailOtpType;
      const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
      return aqui(error ? "/entrar?error=enlace" : destino);
    }
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      return aqui(error ? "/entrar?error=enlace" : destino);
    }
  } catch {
    return aqui("/entrar?error=enlace");
  }
  return aqui("/entrar?error=enlace");
}
