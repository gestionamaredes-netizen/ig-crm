"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requerirEquipo } from "@/lib/auth";
import { desdeBultos, hoy, parsearEntero } from "@/lib/formato";
import { anotar } from "@/lib/datos/bitacora";
import { actualizarProducto, crearProducto, obtenerProducto } from "@/lib/datos/productos";
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
  const rol = await requerirEquipo();
  const nombre = texto(formData, "nombre");
  if (!nombre) volverConError("/deposito/productos", "El producto necesita un nombre.");

  const stock = parsearEntero(texto(formData, "stock") || "0");
  const minimo = parsearEntero(texto(formData, "stockMinimo") || "0");
  const porBulto = parsearEntero(texto(formData, "unidadesPorBulto") || "12");
  if (stock === null || stock < 0) volverConError("/deposito/productos", "El stock inicial tiene que ser un entero.");
  if (minimo === null || minimo < 0) volverConError("/deposito/productos", "El stock mínimo tiene que ser un entero.");
  if (porBulto === null || porBulto < 1) {
    volverConError("/deposito/productos", "Las unidades por bulto tienen que ser 1 o más.");
  }

  // El depósito cuenta mercadería: el producto nace en cero y el costo y el
  // precio se cargan desde Comercial → Precios.
  const id = await crearProducto({
    nombre,
    presentacion: texto(formData, "presentacion"),
    unidadesPorBulto: porBulto,
    stock,
    stockMinimo: minimo,
    costoCentavos: 0,
    precioCentavos: 0,
  });
  await anotar({ actor: rol, accion: "Alta de producto", entidad: "producto", entidadId: id, detalle: nombre });

  refrescarTodo();
  redirect("/deposito/productos");
}

export async function accionActualizarProducto(formData: FormData) {
  await requerirEquipo();
  const id = texto(formData, "id");
  const nombre = texto(formData, "nombre");
  const minimo = parsearEntero(texto(formData, "stockMinimo") || "0");

  if (!id || !nombre) volverConError("/deposito/productos", "Falta el nombre del producto.");
  if (minimo === null || minimo < 0) volverConError("/deposito/productos", "El stock mínimo tiene que ser un entero.");

  /*
   * Solo lo que hay en el formulario del depósito. El costo y el precio no se
   * nombran acá a propósito: si se leyeran del formulario —que no los trae—
   * quedarían en cero cada vez que alguien guarda un nombre.
   */
  const porBulto = parsearEntero(texto(formData, "unidadesPorBulto") || "12");
  if (porBulto === null || porBulto < 1) {
    volverConError("/deposito/productos", "Las unidades por bulto tienen que ser 1 o más.");
  }

  await actualizarProducto(id, {
    nombre,
    presentacion: texto(formData, "presentacion"),
    unidadesPorBulto: porBulto,
    stockMinimo: minimo,
  });
  refrescarTodo();
  redirect("/deposito/productos");
}

export async function accionCambiarEstadoProducto(formData: FormData) {
  const rol = await requerirEquipo();
  const id = texto(formData, "id");
  const activo = texto(formData, "activo") === "1";
  await actualizarProducto(id, { activo });
  await anotar({
    actor: rol,
    accion: activo ? "Producto reactivado" : "Producto archivado",
    entidad: "producto",
    entidadId: id,
  });
  refrescarTodo();
}

// ---------- Movimientos ----------

/**
 * El galpón cuenta en bultos y el sistema guarda unidades. La equivalencia sale
 * del producto, no de un número fijo: no todos los productos vienen de a doce.
 */
async function aUnidades(productoId: string, cantidad: number, medida: string, destino: string): Promise<number> {
  if (medida !== "bultos") return cantidad;

  const producto = await obtenerProducto(productoId);
  if (!producto) volverConError(destino, "Ese producto ya no existe.");
  return desdeBultos(cantidad, producto.unidadesPorBulto);
}

export async function accionRegistrarEntrada(formData: FormData) {
  const rol = await requerirEquipo();
  const cantidad = parsearEntero(texto(formData, "cantidad"));
  if (cantidad === null) volverConError("/deposito/movimientos", "La cantidad tiene que ser un número entero.");

  const productoId = texto(formData, "productoId");
  const unidades = await aUnidades(productoId, cantidad, texto(formData, "medida"), "/deposito/movimientos");
  const motivo = texto(formData, "motivo") || "Compra de mercadería";
  try {
    await registrarEntrada({
      productoId,
      cantidad: unidades,
      motivo,
      fecha: texto(formData, "fecha") || hoy(),
    });
  } catch (error) {
    if (error instanceof ErrorStock) volverConError("/deposito/movimientos", error.message);
    throw error;
  }
  await anotar({
    actor: rol,
    accion: "Entrada de mercadería",
    entidad: "producto",
    entidadId: productoId,
    detalle: `+${unidades} unidades · ${motivo}`,
  });

  refrescarTodo();
  redirect("/deposito/movimientos");
}

export async function accionRegistrarAjuste(formData: FormData) {
  const rol = await requerirEquipo();
  const cantidad = parsearEntero(texto(formData, "cantidad"));
  if (cantidad === null || cantidad === 0) {
    volverConError("/deposito/movimientos", "Poné cuántas unidades sobran o faltan (por ejemplo -3).");
  }

  const productoId = texto(formData, "productoId");
  const unidades = await aUnidades(productoId, Math.abs(cantidad), texto(formData, "medida"), "/deposito/movimientos");
  // El signo lo elige el usuario: "faltan" resta, "sobran" suma.
  const conSigno = texto(formData, "sentido") === "resta" ? -unidades : unidades;
  const motivo = texto(formData, "motivo");
  try {
    await registrarAjuste({
      productoId,
      cantidad: conSigno,
      motivo,
      fecha: texto(formData, "fecha") || hoy(),
    });
  } catch (error) {
    if (error instanceof ErrorStock) volverConError("/deposito/movimientos", error.message);
    throw error;
  }
  await anotar({
    actor: rol,
    accion: "Ajuste de inventario",
    entidad: "producto",
    entidadId: productoId,
    detalle: `${conSigno > 0 ? "+" : ""}${conSigno} unidades · ${motivo}`,
  });

  refrescarTodo();
  redirect("/deposito/movimientos");
}
