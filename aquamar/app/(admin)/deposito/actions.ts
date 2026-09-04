"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { puedeVerPlata, requerirEquipo } from "@/lib/auth";
import { hoy, parsearEntero, parsearMonto } from "@/lib/formato";
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
  const conPlata = await puedeVerPlata();
  const nombre = texto(formData, "nombre");
  if (!nombre) volverConError("/deposito/productos", "El producto necesita un nombre.");

  const stock = parsearEntero(texto(formData, "stock") || "0");
  const minimo = parsearEntero(texto(formData, "stockMinimo") || "0");
  if (stock === null || stock < 0) volverConError("/deposito/productos", "El stock inicial tiene que ser un entero.");
  if (minimo === null || minimo < 0) volverConError("/deposito/productos", "El stock mínimo tiene que ser un entero.");

  // El depósito no ve los campos de plata, así que tampoco los manda: el
  // producto nace en cero y la administración le pone precio después.
  let costo = 0;
  let precio = 0;
  if (conPlata) {
    const c = parsearMonto(texto(formData, "costo") || "0");
    const p = parsearMonto(texto(formData, "precio") || "0");
    if (c === null || p === null) volverConError("/deposito/productos", "Revisá el costo y el precio.");
    costo = c;
    precio = p;
  }

  const id = await crearProducto({
    nombre,
    presentacion: texto(formData, "presentacion"),
    stock,
    stockMinimo: minimo,
    costoCentavos: costo,
    precioCentavos: precio,
  });
  await anotar({ actor: rol, accion: "Alta de producto", entidad: "producto", entidadId: id, detalle: nombre });

  refrescarTodo();
  redirect("/deposito/productos");
}

export async function accionActualizarProducto(formData: FormData) {
  const rol = await requerirEquipo();
  const conPlata = await puedeVerPlata();
  const id = texto(formData, "id");
  const nombre = texto(formData, "nombre");
  const minimo = parsearEntero(texto(formData, "stockMinimo") || "0");

  if (!id || !nombre) volverConError("/deposito/productos", "Falta el nombre del producto.");
  if (minimo === null || minimo < 0) volverConError("/deposito/productos", "El stock mínimo tiene que ser un entero.");

  const antes = await obtenerProducto(id);
  if (!antes) volverConError("/deposito/productos", "Ese producto ya no existe.");

  /*
   * Sin el rol acá, un guardado desde el depósito —que no tiene esos campos en
   * pantalla— mandaría el formulario sin costo ni precio y los dejaría en cero.
   * Los campos de plata solo se tocan si quien guarda puede verlos.
   */
  const datos: Parameters<typeof actualizarProducto>[1] = {
    nombre,
    presentacion: texto(formData, "presentacion"),
    stockMinimo: minimo,
  };

  if (conPlata) {
    const costo = parsearMonto(texto(formData, "costo") || "0");
    const precio = parsearMonto(texto(formData, "precio") || "0");
    if (costo === null || precio === null) volverConError("/deposito/productos", "Revisá el costo y el precio.");
    datos.costoCentavos = costo;
    datos.precioCentavos = precio;

    if (costo !== antes.costoCentavos || precio !== antes.precioCentavos) {
      await anotar({
        actor: rol,
        accion: "Cambio de costo o precio",
        entidad: "producto",
        entidadId: id,
        detalle:
          `${antes.nombre}: costo ${(antes.costoCentavos / 100).toFixed(2)} → ${(costo / 100).toFixed(2)}, ` +
          `precio ${(antes.precioCentavos / 100).toFixed(2)} → ${(precio / 100).toFixed(2)}`,
      });
    }
  }

  await actualizarProducto(id, datos);
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

export async function accionRegistrarEntrada(formData: FormData) {
  const rol = await requerirEquipo();
  const cantidad = parsearEntero(texto(formData, "cantidad"));
  if (cantidad === null) volverConError("/deposito/movimientos", "La cantidad tiene que ser un número entero.");

  const motivo = texto(formData, "motivo") || "Compra de mercadería";
  try {
    await registrarEntrada({
      productoId: texto(formData, "productoId"),
      cantidad,
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
    entidadId: texto(formData, "productoId"),
    detalle: `+${cantidad} · ${motivo}`,
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

  // El signo lo elige el usuario: "faltan" resta, "sobran" suma.
  const conSigno = texto(formData, "sentido") === "resta" ? -Math.abs(cantidad) : Math.abs(cantidad);
  const motivo = texto(formData, "motivo");
  try {
    await registrarAjuste({
      productoId: texto(formData, "productoId"),
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
    entidadId: texto(formData, "productoId"),
    detalle: `${conSigno > 0 ? "+" : ""}${conSigno} · ${motivo}`,
  });

  refrescarTodo();
  redirect("/deposito/movimientos");
}
