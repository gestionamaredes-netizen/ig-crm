"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requerirAdmin } from "@/lib/auth";
import { hoy, parsearEntero, parsearMonto } from "@/lib/formato";
import { actualizarProducto, crearProducto } from "@/lib/datos/productos";
import { ErrorStock, registrarAjuste, registrarEntrada } from "@/lib/datos/stock";

function texto(formData: FormData, campo: string): string {
  return String(formData.get(campo) ?? "").trim();
}

function volverConError(ruta: string, mensaje: string): never {
  const separador = ruta.includes("?") ? "&" : "?";
  redirect(`${ruta}${separador}error=${encodeURIComponent(mensaje)}`);
}

/** El depósito y lo comercial miran los mismos números: se refrescan los dos. */
function refrescarTodo() {
  revalidatePath("/deposito", "layout");
  revalidatePath("/comercial", "layout");
}

// ---------- Catálogo ----------

export async function accionCrearProducto(formData: FormData) {
  await requerirAdmin();
  const nombre = texto(formData, "nombre");
  if (!nombre) volverConError("/deposito/productos", "El producto necesita un nombre.");

  const costo = parsearMonto(texto(formData, "costo") || "0");
  const precio = parsearMonto(texto(formData, "precio") || "0");
  const stock = parsearEntero(texto(formData, "stock") || "0");
  const minimo = parsearEntero(texto(formData, "stockMinimo") || "0");

  if (costo === null || precio === null) volverConError("/deposito/productos", "Revisá el costo y el precio.");
  if (stock === null || stock < 0) volverConError("/deposito/productos", "El stock inicial tiene que ser un entero.");
  if (minimo === null || minimo < 0) volverConError("/deposito/productos", "El stock mínimo tiene que ser un entero.");

  crearProducto({
    nombre,
    presentacion: texto(formData, "presentacion"),
    stock,
    stockMinimo: minimo,
    costoCentavos: costo,
    precioCentavos: precio,
  });
  refrescarTodo();
  redirect("/deposito/productos");
}

export async function accionActualizarProducto(formData: FormData) {
  await requerirAdmin();
  const id = texto(formData, "id");
  const nombre = texto(formData, "nombre");
  const costo = parsearMonto(texto(formData, "costo") || "0");
  const precio = parsearMonto(texto(formData, "precio") || "0");
  const minimo = parsearEntero(texto(formData, "stockMinimo") || "0");

  if (!id || !nombre) volverConError("/deposito/productos", "Falta el nombre del producto.");
  if (costo === null || precio === null) volverConError("/deposito/productos", "Revisá el costo y el precio.");
  if (minimo === null || minimo < 0) volverConError("/deposito/productos", "El stock mínimo tiene que ser un entero.");

  actualizarProducto(id, {
    nombre,
    presentacion: texto(formData, "presentacion"),
    stockMinimo: minimo,
    costoCentavos: costo,
    precioCentavos: precio,
  });
  refrescarTodo();
  redirect("/deposito/productos");
}

export async function accionCambiarEstadoProducto(formData: FormData) {
  await requerirAdmin();
  actualizarProducto(texto(formData, "id"), { activo: texto(formData, "activo") === "1" });
  refrescarTodo();
}

// ---------- Movimientos ----------

export async function accionRegistrarEntrada(formData: FormData) {
  await requerirAdmin();
  const cantidad = parsearEntero(texto(formData, "cantidad"));
  if (cantidad === null) volverConError("/deposito/movimientos", "La cantidad tiene que ser un número entero.");

  try {
    registrarEntrada({
      productoId: texto(formData, "productoId"),
      cantidad,
      motivo: texto(formData, "motivo") || "Compra de mercadería",
      fecha: texto(formData, "fecha") || hoy(),
    });
  } catch (error) {
    if (error instanceof ErrorStock) volverConError("/deposito/movimientos", error.message);
    throw error;
  }

  refrescarTodo();
  redirect("/deposito/movimientos");
}

export async function accionRegistrarAjuste(formData: FormData) {
  await requerirAdmin();
  const cantidad = parsearEntero(texto(formData, "cantidad"));
  if (cantidad === null || cantidad === 0) {
    volverConError("/deposito/movimientos", "Poné cuántas unidades sobran o faltan (por ejemplo -3).");
  }

  try {
    registrarAjuste({
      productoId: texto(formData, "productoId"),
      // El signo lo elige el usuario: "faltan" resta, "sobran" suma.
      cantidad: texto(formData, "sentido") === "resta" ? -Math.abs(cantidad) : Math.abs(cantidad),
      motivo: texto(formData, "motivo"),
      fecha: texto(formData, "fecha") || hoy(),
    });
  } catch (error) {
    if (error instanceof ErrorStock) volverConError("/deposito/movimientos", error.message);
    throw error;
  }

  refrescarTodo();
  redirect("/deposito/movimientos");
}
