import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_ACCESO, buscarAcceso, marcarAcceso } from "@/lib/auth";

/** Link directo al panel del comercio: deja la cookie puesta y sigue a /panel. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const sesion = await buscarAcceso(token);
  if (!sesion) {
    return NextResponse.redirect(new URL("/login?error=codigo", request.url));
  }

  await marcarAcceso(sesion.accesoId);
  const respuesta = NextResponse.redirect(new URL("/panel", request.url));
  respuesta.cookies.set(COOKIE_ACCESO, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  });
  return respuesta;
}
