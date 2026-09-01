"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_ACCESO, COOKIE_ADMIN, buscarAcceso, claveAdminCorrecta, galletaAdmin, marcarAcceso } from "@/lib/auth";

const TREINTA_DIAS = 60 * 60 * 24 * 30;

const opcionesCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: TREINTA_DIAS,
  secure: process.env.NODE_ENV === "production",
};

export async function entrarComoAdmin(formData: FormData) {
  const clave = String(formData.get("clave") ?? "");
  if (!claveAdminCorrecta(clave)) redirect("/login?error=clave");

  (await cookies()).set(COOKIE_ADMIN, galletaAdmin(), opcionesCookie);
  redirect("/comercial");
}

export async function entrarConCodigo(formData: FormData) {
  const codigo = String(formData.get("codigo") ?? "").trim();
  // Aceptamos el código pelado o el link completo pegado desde WhatsApp.
  const token = codigo.split("/").filter(Boolean).pop() ?? "";
  const sesion = token ? buscarAcceso(token) : null;
  if (!sesion) redirect("/login?error=codigo");

  marcarAcceso(sesion.accesoId);
  (await cookies()).set(COOKIE_ACCESO, token, opcionesCookie);
  redirect("/panel");
}

export async function salir() {
  const galletas = await cookies();
  galletas.delete(COOKIE_ADMIN);
  galletas.delete(COOKIE_ACCESO);
  redirect("/login");
}
