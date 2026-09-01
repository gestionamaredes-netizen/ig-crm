"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requerirAdmin } from "@/lib/auth";
import { hoy, parsearEntero, parsearMonto } from "@/lib/formato";
import {
  actualizarCliente,
  cambiarEstadoAcceso,
  crearAcceso,
  crearCliente,
  regenerarToken,
} from "@/lib/datos/clientes";
import { ErrorPedido, cambiarEstado, crearPedido, eliminarPedido } from "@/lib/datos/pedidos";
import { ErrorGasto, cambiarEstadoCategoria, crearCategoria, crearGasto, eliminarGasto } from "@/lib/datos/gastos";
import { ErrorStock } from "@/lib/datos/stock";
import { ESTADOS_PEDIDO, type EstadoPedido } from "@/lib/db/schema";

function texto(formData: FormData, campo: string): string {
  return String(formData.get(campo) ?? "").trim();
}

/** Vuelve a la página con el error a la vista en vez de tirar una pantalla en blanco. */
function volverConError(ruta: string, mensaje: string): never {
  const separador = ruta.includes("?") ? "&" : "?";
  redirect(`${ruta}${separador}error=${encodeURIComponent(mensaje)}`);
}

/** Entregar un pedido mueve stock: el depósito también tiene que refrescarse. */
function refrescarTodo() {
  revalidatePath("/comercial", "layout");
  revalidatePath("/deposito", "layout");
}

// ---------- Clientes ----------

export async function accionCrearCliente(formData: FormData) {
  await requerirAdmin();
  const comercio = texto(formData, "comercio");
  if (!comercio) volverConError("/comercial/clientes", "El comercio necesita un nombre.");

  const id = await crearCliente({
    comercio,
    persona: texto(formData, "persona"),
    telefono: texto(formData, "telefono"),
    direccion: texto(formData, "direccion"),
    email: texto(formData, "email"),
    redes: texto(formData, "redes"),
    notas: texto(formData, "notas"),
  });
  revalidatePath("/comercial/clientes");
  redirect(`/comercial/clientes/${id}`);
}

export async function accionActualizarCliente(formData: FormData) {
  await requerirAdmin();
  const id = texto(formData, "id");
  const comercio = texto(formData, "comercio");
  if (!id || !comercio) volverConError(`/comercial/clientes/${id}`, "El comercio necesita un nombre.");

  await actualizarCliente(id, {
    comercio,
    persona: texto(formData, "persona"),
    telefono: texto(formData, "telefono"),
    direccion: texto(formData, "direccion"),
    email: texto(formData, "email"),
    redes: texto(formData, "redes"),
    notas: texto(formData, "notas"),
    activo: formData.get("activo") !== null,
  });
  revalidatePath(`/comercial/clientes/${id}`);
  redirect(`/comercial/clientes/${id}`);
}

export async function accionCrearAcceso(formData: FormData) {
  await requerirAdmin();
  const clienteId = texto(formData, "clienteId");
  const nombre = texto(formData, "nombre");
  if (!nombre) volverConError(`/comercial/clientes/${clienteId}`, "Ponele un nombre al representante.");

  await crearAcceso(clienteId, nombre);
  revalidatePath(`/comercial/clientes/${clienteId}`);
  redirect(`/comercial/clientes/${clienteId}`);
}

export async function accionCambiarAcceso(formData: FormData) {
  await requerirAdmin();
  await cambiarEstadoAcceso(texto(formData, "id"), texto(formData, "activo") === "1");
  revalidatePath(`/comercial/clientes/${texto(formData, "clienteId")}`);
}

export async function accionRegenerarToken(formData: FormData) {
  await requerirAdmin();
  await regenerarToken(texto(formData, "id"));
  revalidatePath(`/comercial/clientes/${texto(formData, "clienteId")}`);
}

// ---------- Pedidos ----------

export async function accionCrearPedido(formData: FormData) {
  await requerirAdmin();
  const clienteId = texto(formData, "clienteId");
  if (!clienteId) volverConError("/comercial/pedidos/nuevo", "Elegí a qué comercio va el pedido.");

  // Cada producto llega como cant_<id>; los vacíos o en cero no entran al pedido.
  const items: { productoId: string; cantidad: number }[] = [];
  for (const [clave, valor] of formData.entries()) {
    if (!clave.startsWith("cant_")) continue;
    const cantidad = parsearEntero(String(valor).trim() || "0");
    if (cantidad === null) volverConError("/comercial/pedidos/nuevo", "Hay una cantidad que no es un número.");
    if (cantidad > 0) items.push({ productoId: clave.slice(5), cantidad });
  }

  try {
    const id = await crearPedido({
      clienteId,
      fecha: texto(formData, "fecha") || hoy(),
      notas: texto(formData, "notas"),
      origen: "admin",
      creadoPor: "Administración",
      items,
    });
    refrescarTodo();
    redirect(`/comercial/pedidos/${id}`);
  } catch (error) {
    if (error instanceof ErrorPedido) volverConError("/comercial/pedidos/nuevo", error.message);
    throw error;
  }
}

export async function accionCambiarEstadoPedido(formData: FormData) {
  await requerirAdmin();
  const id = texto(formData, "id");
  const estado = texto(formData, "estado") as EstadoPedido;
  const destino = `/comercial/pedidos/${id}`;
  if (!ESTADOS_PEDIDO.includes(estado)) volverConError(destino, "Ese estado no existe.");

  try {
    await cambiarEstado(id, estado);
  } catch (error) {
    // Marcar entregado saca del depósito: puede no haber unidades suficientes.
    if (error instanceof ErrorStock) volverConError(destino, error.message);
    if (error instanceof ErrorPedido) volverConError(destino, error.message);
    throw error;
  }
  refrescarTodo();
}

export async function accionEliminarPedido(formData: FormData) {
  await requerirAdmin();
  await eliminarPedido(texto(formData, "id"));
  refrescarTodo();
  redirect("/comercial/pedidos");
}

// ---------- Gastos ----------

export async function accionCrearCategoria(formData: FormData) {
  await requerirAdmin();
  const tipo = texto(formData, "tipo") === "logistico" ? "logistico" : "operativo";
  try {
    await crearCategoria(texto(formData, "nombre"), tipo);
  } catch (error) {
    if (error instanceof ErrorGasto) volverConError("/comercial/gastos", error.message);
    throw error;
  }
  revalidatePath("/comercial/gastos");
  redirect("/comercial/gastos");
}

export async function accionCambiarCategoria(formData: FormData) {
  await requerirAdmin();
  await cambiarEstadoCategoria(texto(formData, "id"), texto(formData, "activo") === "1");
  revalidatePath("/comercial/gastos");
}

export async function accionCrearGasto(formData: FormData) {
  await requerirAdmin();
  const monto = parsearMonto(texto(formData, "monto"));
  if (monto === null) volverConError("/comercial/gastos", "El monto no se entiende. Escribilo así: 12.500,00");

  const pedidoId = texto(formData, "pedidoId");
  try {
    await crearGasto({
      categoriaId: texto(formData, "categoriaId"),
      fecha: texto(formData, "fecha") || hoy(),
      montoCentavos: monto,
      descripcion: texto(formData, "descripcion"),
      pedidoId: pedidoId || null,
    });
  } catch (error) {
    if (error instanceof ErrorGasto) volverConError("/comercial/gastos", error.message);
    throw error;
  }
  revalidatePath("/comercial", "layout");
  redirect("/comercial/gastos");
}

/** Mismo alta de gasto, pero vuelve al pedido en vez de a la lista general. */
export async function accionGastoDePedido(formData: FormData) {
  await requerirAdmin();
  const pedidoId = texto(formData, "pedidoId");
  const destino = `/comercial/pedidos/${pedidoId}`;
  const monto = parsearMonto(texto(formData, "monto"));
  if (monto === null) volverConError(destino, "El monto no se entiende. Escribilo así: 12.500,00");

  try {
    await crearGasto({
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
  revalidatePath("/comercial", "layout");
  redirect(destino);
}

export async function accionEliminarGasto(formData: FormData) {
  await requerirAdmin();
  await eliminarGasto(texto(formData, "id"));
  // El gasto puede estar imputado a un pedido: se refresca toda el área.
  revalidatePath("/comercial", "layout");
}
