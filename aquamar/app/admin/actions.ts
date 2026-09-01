"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requerirAdmin } from "@/lib/auth";
import { hoy, parsearEntero, parsearMonto } from "@/lib/formato";
import { actualizarProducto, crearProducto } from "@/lib/datos/productos";
import {
  actualizarCliente,
  cambiarEstadoAcceso,
  crearAcceso,
  crearCliente,
  regenerarToken,
} from "@/lib/datos/clientes";
import { ErrorPedido, cambiarEstado, crearPedido, eliminarPedido } from "@/lib/datos/pedidos";
import { ErrorGasto, cambiarEstadoCategoria, crearCategoria, crearGasto, eliminarGasto } from "@/lib/datos/gastos";
import { ESTADOS_PEDIDO, type EstadoPedido } from "@/lib/db/schema";

function texto(formData: FormData, campo: string): string {
  return String(formData.get(campo) ?? "").trim();
}

/** Vuelve a la página con el error a la vista en vez de tirar una pantalla en blanco. */
function volverConError(ruta: string, mensaje: string): never {
  const separador = ruta.includes("?") ? "&" : "?";
  redirect(`${ruta}${separador}error=${encodeURIComponent(mensaje)}`);
}

// ---------- Inventario ----------

export async function accionCrearProducto(formData: FormData) {
  await requerirAdmin();
  const nombre = texto(formData, "nombre");
  if (!nombre) volverConError("/admin/inventario", "El producto necesita un nombre.");

  const costo = parsearMonto(texto(formData, "costo") || "0");
  const precio = parsearMonto(texto(formData, "precio") || "0");
  const stock = parsearEntero(texto(formData, "stock") || "0");
  if (costo === null || precio === null) volverConError("/admin/inventario", "Revisá el costo y el precio.");
  if (stock === null || stock < 0) volverConError("/admin/inventario", "El stock tiene que ser un número entero.");

  crearProducto({
    nombre,
    presentacion: texto(formData, "presentacion"),
    stock,
    costoCentavos: costo,
    precioCentavos: precio,
  });
  revalidatePath("/admin/inventario");
  redirect("/admin/inventario");
}

export async function accionActualizarProducto(formData: FormData) {
  await requerirAdmin();
  const id = texto(formData, "id");
  const nombre = texto(formData, "nombre");
  const costo = parsearMonto(texto(formData, "costo") || "0");
  const precio = parsearMonto(texto(formData, "precio") || "0");
  const stock = parsearEntero(texto(formData, "stock") || "0");

  if (!id || !nombre) volverConError("/admin/inventario", "Falta el nombre del producto.");
  if (costo === null || precio === null) volverConError("/admin/inventario", "Revisá el costo y el precio.");
  if (stock === null || stock < 0) volverConError("/admin/inventario", "El stock tiene que ser un número entero.");

  actualizarProducto(id, {
    nombre,
    presentacion: texto(formData, "presentacion"),
    stock,
    costoCentavos: costo,
    precioCentavos: precio,
  });
  revalidatePath("/admin/inventario");
  redirect("/admin/inventario");
}

export async function accionCambiarEstadoProducto(formData: FormData) {
  await requerirAdmin();
  actualizarProducto(texto(formData, "id"), { activo: texto(formData, "activo") === "1" });
  revalidatePath("/admin/inventario");
}

// ---------- Clientes ----------

export async function accionCrearCliente(formData: FormData) {
  await requerirAdmin();
  const comercio = texto(formData, "comercio");
  if (!comercio) volverConError("/admin/clientes", "El comercio necesita un nombre.");

  const id = crearCliente({
    comercio,
    persona: texto(formData, "persona"),
    telefono: texto(formData, "telefono"),
    direccion: texto(formData, "direccion"),
    email: texto(formData, "email"),
    redes: texto(formData, "redes"),
    notas: texto(formData, "notas"),
  });
  revalidatePath("/admin/clientes");
  redirect(`/admin/clientes/${id}`);
}

export async function accionActualizarCliente(formData: FormData) {
  await requerirAdmin();
  const id = texto(formData, "id");
  const comercio = texto(formData, "comercio");
  if (!id || !comercio) volverConError(`/admin/clientes/${id}`, "El comercio necesita un nombre.");

  actualizarCliente(id, {
    comercio,
    persona: texto(formData, "persona"),
    telefono: texto(formData, "telefono"),
    direccion: texto(formData, "direccion"),
    email: texto(formData, "email"),
    redes: texto(formData, "redes"),
    notas: texto(formData, "notas"),
    activo: formData.get("activo") !== null,
  });
  revalidatePath(`/admin/clientes/${id}`);
  redirect(`/admin/clientes/${id}`);
}

export async function accionCrearAcceso(formData: FormData) {
  await requerirAdmin();
  const clienteId = texto(formData, "clienteId");
  const nombre = texto(formData, "nombre");
  if (!nombre) volverConError(`/admin/clientes/${clienteId}`, "Ponele un nombre al representante.");

  crearAcceso(clienteId, nombre);
  revalidatePath(`/admin/clientes/${clienteId}`);
  redirect(`/admin/clientes/${clienteId}`);
}

export async function accionCambiarAcceso(formData: FormData) {
  await requerirAdmin();
  cambiarEstadoAcceso(texto(formData, "id"), texto(formData, "activo") === "1");
  revalidatePath(`/admin/clientes/${texto(formData, "clienteId")}`);
}

export async function accionRegenerarToken(formData: FormData) {
  await requerirAdmin();
  regenerarToken(texto(formData, "id"));
  revalidatePath(`/admin/clientes/${texto(formData, "clienteId")}`);
}

// ---------- Pedidos ----------

export async function accionCrearPedido(formData: FormData) {
  await requerirAdmin();
  const clienteId = texto(formData, "clienteId");
  if (!clienteId) volverConError("/admin/pedidos/nuevo", "Elegí a qué comercio va el pedido.");

  // Cada producto llega como cant_<id>; los vacíos o en cero no entran al pedido.
  const items: { productoId: string; cantidad: number }[] = [];
  for (const [clave, valor] of formData.entries()) {
    if (!clave.startsWith("cant_")) continue;
    const cantidad = parsearEntero(String(valor).trim() || "0");
    if (cantidad === null) volverConError("/admin/pedidos/nuevo", "Hay una cantidad que no es un número.");
    if (cantidad > 0) items.push({ productoId: clave.slice(5), cantidad });
  }

  try {
    const id = crearPedido({
      clienteId,
      fecha: texto(formData, "fecha") || hoy(),
      notas: texto(formData, "notas"),
      origen: "admin",
      creadoPor: "Administración",
      items,
    });
    revalidatePath("/admin/pedidos");
    redirect(`/admin/pedidos/${id}`);
  } catch (error) {
    if (error instanceof ErrorPedido) volverConError("/admin/pedidos/nuevo", error.message);
    throw error;
  }
}

export async function accionCambiarEstadoPedido(formData: FormData) {
  await requerirAdmin();
  const id = texto(formData, "id");
  const estado = texto(formData, "estado") as EstadoPedido;
  if (!ESTADOS_PEDIDO.includes(estado)) volverConError(`/admin/pedidos/${id}`, "Ese estado no existe.");

  cambiarEstado(id, estado);
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/inventario");
}

export async function accionEliminarPedido(formData: FormData) {
  await requerirAdmin();
  eliminarPedido(texto(formData, "id"));
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/inventario");
  redirect("/admin/pedidos");
}

// ---------- Gastos ----------

export async function accionCrearCategoria(formData: FormData) {
  await requerirAdmin();
  const tipo = texto(formData, "tipo") === "logistico" ? "logistico" : "operativo";
  try {
    crearCategoria(texto(formData, "nombre"), tipo);
  } catch (error) {
    if (error instanceof ErrorGasto) volverConError("/admin/gastos", error.message);
    throw error;
  }
  revalidatePath("/admin/gastos");
  redirect("/admin/gastos");
}

export async function accionCambiarCategoria(formData: FormData) {
  await requerirAdmin();
  cambiarEstadoCategoria(texto(formData, "id"), texto(formData, "activo") === "1");
  revalidatePath("/admin/gastos");
}

export async function accionCrearGasto(formData: FormData) {
  await requerirAdmin();
  const monto = parsearMonto(texto(formData, "monto"));
  if (monto === null) volverConError("/admin/gastos", "El monto no se entiende. Escribilo así: 12.500,00");

  const pedidoId = texto(formData, "pedidoId");
  try {
    crearGasto({
      categoriaId: texto(formData, "categoriaId"),
      fecha: texto(formData, "fecha") || hoy(),
      montoCentavos: monto,
      descripcion: texto(formData, "descripcion"),
      pedidoId: pedidoId || null,
    });
  } catch (error) {
    if (error instanceof ErrorGasto) volverConError("/admin/gastos", error.message);
    throw error;
  }
  revalidatePath("/admin/gastos");
  revalidatePath("/admin/reportes");
  redirect("/admin/gastos");
}

/** Mismo alta de gasto, pero vuelve al pedido en vez de a la lista general. */
export async function accionGastoDePedido(formData: FormData) {
  await requerirAdmin();
  const pedidoId = texto(formData, "pedidoId");
  const destino = `/admin/pedidos/${pedidoId}`;
  const monto = parsearMonto(texto(formData, "monto"));
  if (monto === null) volverConError(destino, "El monto no se entiende. Escribilo así: 12.500,00");

  try {
    crearGasto({
      categoriaId: texto(formData, "categoriaId"),
      fecha: texto(formData, "fecha") || hoy(),
      montoCentavos: monto,
      descripcion: texto(formData, "descripcion"),
      pedidoId,
    });
  } catch (error) {
    if (error instanceof ErrorGasto) volverConError(destino, error.message);
    throw error;
  }
  revalidatePath(destino);
  revalidatePath("/admin/gastos");
  redirect(destino);
}

export async function accionEliminarGasto(formData: FormData) {
  await requerirAdmin();
  eliminarGasto(texto(formData, "id"));
  // El gasto puede estar imputado a un pedido: se refresca todo el panel.
  revalidatePath("/admin", "layout");
}
