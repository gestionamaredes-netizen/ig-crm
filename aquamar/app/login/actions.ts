"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_ACCESO, COOKIE_ADMIN, buscarAcceso, galletaDeRol, marcarAcceso, rolDeClave } from "@/lib/auth";

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
  const rol = rolDeClave(clave);
  if (!rol) redirect("/login?error=clave");

  (await cookies()).set(COOKIE_ADMIN, galletaDeRol(rol), opcionesCookie);
  // El depósito no tiene nada que hacer en la parte comercial.
  redirect(rol === "admin" ? "/comercial" : "/deposito");
}

export async function entrarConCodigo(formData: FormData) {
  const codigo = String(formData.get("codigo") ?? "").trim();
  // Aceptamos el código pelado o el link completo pegado desde WhatsApp.
  const token = codigo.split("/").filter(Boolean).pop() ?? "";
  const sesion = token ? await buscarAcceso(token) : null;
  if (!sesion) redirect("/login?error=codigo");

  await marcarAcceso(sesion.accesoId);
  (await cookies()).set(COOKIE_ACCESO, token, opcionesCookie);
  redirect("/panel");
}

export async function salir() {
  const galletas = await cookies();
  galletas.delete(COOKIE_ADMIN);
  galletas.delete(COOKIE_ACCESO);
  redirect("/login");
}
