import { NextResponse, type NextRequest } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Next precarga los enlaces con GET: eso nunca debe cerrar la sesión. */
function esPrecarga(req: NextRequest) {
  const h = req.headers;
  return (
    h.has("next-router-prefetch") ||
    h.has("rsc") ||
    /prefetch/i.test(h.get("purpose") ?? "") ||
    /prefetch/i.test(h.get("sec-purpose") ?? "")
  );
}

/** Cierra la sesión de este navegador y vuelve a la portada. */
async function cerrar(req: NextRequest) {
  if (esPrecarga(req)) return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  const supabase = getServerSupabase();
  if (supabase) {
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // Si Supabase no contesta, igual se manda a la portada.
    }
  }
  const res = NextResponse.redirect(new URL("/", req.nextUrl.origin), { status: 303 });
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function POST(req: NextRequest) {
  return cerrar(req);
}

export async function GET(req: NextRequest) {
  return cerrar(req);
}
