"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requerirCliente } from "@/lib/auth";
import { hoy, parsearEntero } from "@/lib/formato";
import { ErrorPanel, eliminarVenta, registrarVenta } from "@/lib/datos/panel";
import { ErrorPedido, crearPedido } from "@/lib/datos/pedidos";

function texto(formData: FormData, campo: string): string {
  return String(formData.get(campo) ?? "").trim();
}

function volverConError(ruta: string, mensaje: string): never {
  const separador = ruta.includes("?") ? "&" : "?";
  redirect(`${ruta}${separador}error=${encodeURIComponent(mensaje)}`);
}

export async function accionPedirDesdePanel(formData: FormData) {
  const sesion = await requerirCliente();

  const items: { productoId: string; cantidad: number }[] = [];
  for (const [clave, valor] of formData.entries()) {
    if (!clave.startsWith("cant_")) continue;
    const cantidad = parsearEntero(String(valor).trim() || "0");
    if (cantidad === null) volverConError("/panel/pedir", "Hay una cantidad que no es un número.");
    if (cantidad > 0) items.push({ productoId: clave.slice(5), cantidad });
  }

  try {
    crearPedido({
      clienteId: sesion.clienteId,
      fecha: hoy(),
      notas: texto(formData, "notas"),
      origen: sesion.rol,
      creadoPor: sesion.nombre,
      items,
    });
  } catch (error) {
    if (error instanceof ErrorPedido) volverConError("/panel/pedir", error.message);
    throw error;
  }

  revalidatePath("/panel", "layout");
  revalidatePath("/admin", "layout");
  redirect("/panel/entregas?ok=1");
}

export async function accionRegistrarVenta(formData: FormData) {
  const sesion = await requerirCliente();
  const cantidad = parsearEntero(texto(formData, "cantidad"));
  if (cantidad === null) volverConError("/panel/ventas", "Poné una cantidad válida.");

  try {
    registrarVenta({
      clienteId: sesion.clienteId,
      productoId: texto(formData, "productoId"),
      cantidad,
      fecha: texto(formData, "fecha") || hoy(),
      registradoPor: sesion.nombre,
    });
  } catch (error) {
    if (error instanceof ErrorPanel) volverConError("/panel/ventas", error.message);
    throw error;
  }

  revalidatePath("/panel", "layout");
  redirect("/panel/ventas");
}

export async function accionEliminarVenta(formData: FormData) {
  const sesion = await requerirCliente();
  eliminarVenta(texto(formData, "id"), sesion.clienteId);
  revalidatePath("/panel", "layout");
}
