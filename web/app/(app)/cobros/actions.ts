"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { tieneAccesoCompleto } from "@/lib/auth-guard";
import { parsearMonto } from "@/lib/finanzas/montos";

// Módulo de plata: cada acción revalida el acceso completo antes de tocar nada
// (el middleware bloquea por ruta, pero los Server Actions se despachan por un
// ID global que no pasa por ahí). Fallo silencioso con `return;`.

function texto(fd: FormData, campo: string): string {
  return String(fd.get(campo) ?? "").trim();
}
function monto(fd: FormData, campo: string): number {
  return parsearMonto(String(fd.get(campo) ?? "")) ?? 0;
}
function hoy(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }); // YYYY-MM-DD
}
function refrescar() {
  revalidatePath("/cobros");
  revalidatePath("/dashboard");
}

export async function crearCliente(fd: FormData) {
  if (!(await tieneAccesoCompleto())) return;
  const nombre = texto(fd, "nombre");
  if (!nombre) return;
  const sb = await createClient();
  await sb.from("cobros_clientes").insert({
    nombre,
    tipo: texto(fd, "tipo") === "mensual" ? "mensual" : "unico",
    notas: texto(fd, "notas"),
  });
  refrescar();
}

export async function editarCliente(fd: FormData) {
  if (!(await tieneAccesoCompleto())) return;
  const id = texto(fd, "id");
  const nombre = texto(fd, "nombre");
  if (!id || !nombre) return;
  const sb = await createClient();
  await sb
    .from("cobros_clientes")
    .update({ nombre, tipo: texto(fd, "tipo") === "mensual" ? "mensual" : "unico", notas: texto(fd, "notas") })
    .eq("id", id);
  revalidatePath(`/cobros/${id}`);
  refrescar();
}

export async function borrarCliente(fd: FormData) {
  if (!(await tieneAccesoCompleto())) return;
  const id = texto(fd, "id");
  if (!id) return;
  const sb = await createClient();
  await sb.from("cobros_clientes").delete().eq("id", id); // cascade borra cobros/costos/pagos
  refrescar();
}

export async function crearCobro(fd: FormData) {
  if (!(await tieneAccesoCompleto())) return;
  const clienteId = texto(fd, "clienteId");
  if (!clienteId) return;
  const sb = await createClient();
  await sb.from("cobros").insert({
    cliente_id: clienteId,
    concepto: texto(fd, "concepto"),
    total: monto(fd, "total"),
    fecha: texto(fd, "fecha") || hoy(),
  });
  revalidatePath(`/cobros/${clienteId}`);
  refrescar();
}

export async function editarCobro(fd: FormData) {
  if (!(await tieneAccesoCompleto())) return;
  const id = texto(fd, "id");
  const clienteId = texto(fd, "clienteId");
  if (!id) return;
  const sb = await createClient();
  await sb
    .from("cobros")
    .update({ concepto: texto(fd, "concepto"), total: monto(fd, "total"), fecha: texto(fd, "fecha") || hoy() })
    .eq("id", id);
  if (clienteId) revalidatePath(`/cobros/${clienteId}`);
  refrescar();
}

export async function borrarCobro(fd: FormData) {
  if (!(await tieneAccesoCompleto())) return;
  const id = texto(fd, "id");
  const clienteId = texto(fd, "clienteId");
  if (!id) return;
  const sb = await createClient();
  await sb.from("cobros").delete().eq("id", id);
  if (clienteId) revalidatePath(`/cobros/${clienteId}`);
  refrescar();
}

export async function agregarCosto(fd: FormData) {
  if (!(await tieneAccesoCompleto())) return;
  const cobroId = texto(fd, "cobroId");
  const clienteId = texto(fd, "clienteId");
  if (!cobroId) return;
  const sb = await createClient();
  await sb.from("cobros_costos").insert({ cobro_id: cobroId, concepto: texto(fd, "concepto"), monto: monto(fd, "monto") });
  if (clienteId) revalidatePath(`/cobros/${clienteId}`);
  refrescar();
}

export async function borrarCosto(fd: FormData) {
  if (!(await tieneAccesoCompleto())) return;
  const id = texto(fd, "id");
  const clienteId = texto(fd, "clienteId");
  if (!id) return;
  const sb = await createClient();
  await sb.from("cobros_costos").delete().eq("id", id);
  if (clienteId) revalidatePath(`/cobros/${clienteId}`);
  refrescar();
}

export async function agregarPago(fd: FormData) {
  if (!(await tieneAccesoCompleto())) return;
  const cobroId = texto(fd, "cobroId");
  const clienteId = texto(fd, "clienteId");
  if (!cobroId) return;
  const sb = await createClient();
  await sb.from("cobros_pagos").insert({
    cobro_id: cobroId,
    monto: monto(fd, "monto"),
    fecha: texto(fd, "fecha") || hoy(),
    medio: texto(fd, "medio"),
    cuenta: texto(fd, "cuenta"),
  });
  if (clienteId) revalidatePath(`/cobros/${clienteId}`);
  refrescar();
}

export async function borrarPago(fd: FormData) {
  if (!(await tieneAccesoCompleto())) return;
  const id = texto(fd, "id");
  const clienteId = texto(fd, "clienteId");
  if (!id) return;
  const sb = await createClient();
  await sb.from("cobros_pagos").delete().eq("id", id);
  if (clienteId) revalidatePath(`/cobros/${clienteId}`);
  refrescar();
}
