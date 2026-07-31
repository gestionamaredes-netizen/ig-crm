import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAllowed, accessTier, landingPath, canAccessPath, authEnabled } from "@/lib/auth-config";

export async function updateSession(request: NextRequest) {
  // Interruptor de login. En producción está prendido salvo que se apague a
  // propósito (ver authEnabled): si la env var falta en el deploy, la app no
  // queda abierta. En dev local sigue apagado salvo NEXT_PUBLIC_AUTH_ENABLED=true.
  if (!authEnabled()) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = path.startsWith("/login") || path.startsWith("/auth");

  // Usuario logueado pero no autorizado → cerrar sesión y mandar a login.
  if (user && !isAllowed(user.email)) {
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("denied", "1");
    return NextResponse.redirect(url);
  }

  // Sin sesión en ruta protegida → login.
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const tier = accessTier(user?.email);

  // Con sesión entrando a /login → a su pantalla de inicio (dashboard o caja).
  if (user && path.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = landingPath(tier);
    return NextResponse.redirect(url);
  }

  // Usuario sin permiso para esta ruta → a su pantalla de inicio (según su tier).
  // Antes iba fijo a /cambio, lo que dejaba a un runner en un loop de redirects
  // (el runner no puede ver /cambio). landingPath resuelve la pantalla correcta.
  if (user && !isPublic && !canAccessPath(tier, path)) {
    const url = request.nextUrl.clone();
    url.pathname = landingPath(tier);
    return NextResponse.redirect(url);
  }

  return response;
}
