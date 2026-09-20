"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, claveCorrecta, esPersona, galleta } from "@/lib/auth";

export async function entrar(formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "");
  const clave = String(formData.get("clave") ?? "");

  if (!esPersona(nombre)) redirect("/login?error=nombre");
  if (!claveCorrecta(clave)) redirect("/login?error=clave");

  (await cookies()).set(COOKIE, galleta(nombre), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 120,
  });
  redirect("/");
}

export async function salir() {
  (await cookies()).delete(COOKIE);
  redirect("/login");
}
