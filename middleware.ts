import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/env";

/** Rutas que piden sesión. /pruebalo/chat NO está aquí: es la demostración. */
function esProtegida(pathname: string) {
  return ["/panel", "/chat"].some((base) => pathname === base || pathname.startsWith(`${base}/`));
}

/** ¿Trae la cookie de sesión de Supabase? (sb-<proyecto>-auth-token, a veces en trozos .0 .1) */
function traeSesion(request: NextRequest) {
  return request.cookies.getAll().some((c) => /^sb-.+-auth-token(\.\d+)?$/.test(c.name));
}

function haciaEntrar(request: NextRequest, params: Record<string, string>) {
  const url = request.nextUrl.clone();
  url.pathname = "/entrar";
  url.search = "";
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return NextResponse.redirect(url);
}

/**
 * Mantiene viva la sesión (renueva la cookie cuando toca) y protege /panel y /chat.
 * Sin variables de Supabase, el sitio público sigue funcionando y las rutas
 * protegidas mandan a /entrar.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const protegida = esProtegida(pathname);

  if (!isSupabaseConfigured()) {
    return protegida ? haciaEntrar(request, { error: "no_configurado" }) : NextResponse.next();
  }

  // Sin cookie de sesión no hay nada que renovar ni que preguntar.
  if (!traeSesion(request)) {
    return protegida ? haciaEntrar(request, { next: `${pathname}${search}` }) : NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        // La respuesta lleva cookies de sesión: que nada la guarde en caché.
        Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  let conSesion = false;
  try {
    const { data } = await supabase.auth.getClaims();
    conSesion = Boolean(data?.claims);
  } catch {
    conSesion = false;
  }

  if (conSesion || !protegida) return response;

  // Sesión vencida o inválida en una ruta protegida: a entrar, conservando
  // las cookies (y los encabezados de caché) que acaba de fijar Supabase.
  const redirect = haciaEntrar(request, { next: `${pathname}${search}` });
  response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
  ["cache-control", "expires", "pragma"].forEach((h) => {
    const v = response.headers.get(h);
    if (v) redirect.headers.set(h, v);
  });
  return redirect;
}

export const config = {
  matcher: [
    // Todo, menos archivos de Next, archivos estáticos y las dos APIs públicas.
    "/((?!_next/static|_next/image|favicon\\.ico|api/lista|api/contacto|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map|txt|xml|json|woff|woff2|ttf|otf|mp3|mp4|webm)$).*)",
  ],
};
