"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requerirAdmin } from "@/lib/auth";
import { anotar } from "@/lib/datos/bitacora";
import { actualizarProducto, obtenerProducto } from "@/lib/datos/productos";
import { desdeBultos, formatearPesos, hoy, parsearEntero, parsearMonto, precioPorUnidad } from "@/lib/formato";
import {
  actualizarCliente,
  cambiarEstadoAcceso,
  crearAcceso,
  crearCliente,
  obtenerCliente,
  regenerarToken,
} from "@/lib/datos/clientes";
import {
  ErrorPedido,
  actualizarEntrega,
  actualizarFormaPago,
  cambiarEstado,
  crearPedido,
  eliminarPedido,
  registrarCobro,
} from "@/lib/datos/pedidos";
import { ErrorGasto, cambiarEstadoCategoria, crearCategoria, crearGasto, eliminarGasto } from "@/lib/datos/gastos";
import { ErrorStock } from "@/lib/datos/stock";
import {
  ErrorCompra,
  anularCompra,
  confirmarCompra,
  crearCompra,
  eliminarBorrador,
  registrarPago,
} from "@/lib/datos/compras";
import { ErrorProveedor, actualizarProveedor, crearProveedor } from "@/lib/datos/proveedores";
import {
  ErrorVendedor,
  actualizarVendedor,
  crearVendedor,
  eliminarPagoComision,
  obtenerVendedor,
  registrarPagoComision,
} from "@/lib/datos/vendedores";
import {
  ErrorPrecio,
  actualizarEscala,
  actualizarLista,
  crearEscala,
  crearLista,
  eliminarEscala,
  eliminarLista,
  marcarPredeterminada,
} from "@/lib/datos/precios";
import {
  ErrorCaja,
  eliminarMovimiento,
  registrarManual,
  transferir,
} from "@/lib/datos/caja";
import { guardarNumero, guardarPreciosConIva, guardarRegimen, type Regimen } from "@/lib/datos/config";
import {
  ESTADOS_PEDIDO,
  VENDEDOR_NUEVO,
  type EstadoPedido,
  type MedioPago,
  type ModalidadVendedor,
} from "@/lib/db/schema";

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

/**
 * El vendedor del comercio, creándolo si se pidió uno nuevo desde el mismo
 * formulario. Devuelve null cuando lo atiende la casa.
 *
 * Se crea antes que el comercio a propósito: si el alta del vendedor falla, el
 * comercio no queda guardado con un dueño que no existe.
 */
async function vendedorDelFormulario(formData: FormData, destino: string): Promise<string | null> {
  const elegido = texto(formData, "vendedorId");
  if (elegido !== VENDEDOR_NUEVO) {
    if (!elegido) return null;
    // Un id que no existe dejaría al comercio con un dueño fantasma: sin
    // comisión, sin color y sin que nadie se entere hasta la liquidación.
    if (!(await obtenerVendedor(elegido))) volverConError(destino, "Ese vendedor ya no existe.");
    return elegido;
  }

  const nombre = texto(formData, "vendedorNuevoNombre");
  if (!nombre) volverConError(destino, "Escribí el nombre del vendedor nuevo.");

  const escrito = texto(formData, "vendedorNuevaComision");
  const comision = escrito ? parsearMonto(escrito) : 0;
  if (escrito && (comision === null || comision < 0)) {
    volverConError(destino, "Revisá la comisión del vendedor: escribila así 500,00");
  }

  try {
    return await crearVendedor({
      nombre,
      color: texto(formData, "vendedorNuevoColor") || "azul",
      modalidad: "comisión",
      comisionPorBultoCentavos: comision ?? 0,
    });
  } catch (error) {
    if (error instanceof ErrorVendedor) volverConError(destino, error.message);
    throw error;
  }
}

export async function accionCrearCliente(formData: FormData) {
  await requerirAdmin();
  const comercio = texto(formData, "comercio");
  if (!comercio) volverConError("/comercial/clientes", "El comercio necesita un nombre.");

  const vendedorId = await vendedorDelFormulario(formData, "/comercial/clientes");
  const id = await crearCliente({
    comercio,
    vendedorId,
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
    razonSocial: texto(formData, "razonSocial"),
    cuit: texto(formData, "cuit"),
    condicionFiscal: texto(formData, "condicionFiscal"),
    tipo: texto(formData, "tipo") || "comercio",
    // Vacío significa "la predeterminada": se guarda como null, no como "".
    listaPrecioId: texto(formData, "listaPrecioId") || null,
    // Vacío es "lo atiende la casa": sin vendedor no hay comisión que liquidar.
    vendedorId: await vendedorDelFormulario(formData, `/comercial/clientes/${id}`),
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

  /*
   * Cada producto llega como cant_<id>, medida_<id> y, si se pisó a mano,
   * precio_<id>. Los renglones sin cantidad no entran al pedido.
   *
   * La medida es la del mostrador: si la venta fue por bulto, tanto la cantidad
   * como el precio vienen expresados en bultos y hay que bajarlos a unidades,
   * que es la única medida en la que el pedido se guarda. La equivalencia sale
   * de cada producto —no todos vienen de a doce—, así que se leen del catálogo
   * y no de un número fijo escondido acá.
   */
  const renglones: { productoId: string; cantidad: number; precio: number | null; enBultos: boolean }[] = [];
  for (const [clave, valor] of formData.entries()) {
    if (!clave.startsWith("cant_")) continue;
    const productoId = clave.slice(5);
    const cantidad = parsearEntero(String(valor).trim() || "0");
    if (cantidad === null) volverConError("/comercial/pedidos/nuevo", "Hay una cantidad que no es un número.");
    if (cantidad <= 0) continue;

    const escrito = String(formData.get(`precio_${productoId}`) ?? "").trim();
    const precio = escrito ? parsearMonto(escrito) : null;
    if (escrito && (precio === null || precio < 0)) {
      volverConError("/comercial/pedidos/nuevo", "Revisá el precio: escribilo así 6.500,00");
    }
    const enBultos = String(formData.get(`medida_${productoId}`) ?? "") === "bultos";
    renglones.push({ productoId, cantidad, precio, enBultos });
  }

  const items: { productoId: string; cantidad: number; precioUnitCentavos?: number | null }[] = [];
  for (const r of renglones) {
    if (!r.enBultos) {
      items.push({ productoId: r.productoId, cantidad: r.cantidad, precioUnitCentavos: r.precio });
      continue;
    }
    const producto = await obtenerProducto(r.productoId);
    if (!producto) volverConError("/comercial/pedidos/nuevo", "Hay un producto que ya no existe en el catálogo.");
    const porBulto = producto.unidadesPorBulto;
    items.push({
      productoId: r.productoId,
      cantidad: desdeBultos(r.cantidad, porBulto),
      precioUnitCentavos: r.precio === null ? null : precioPorUnidad(r.precio, porBulto),
    });
  }

  /*
   * La comisión del pedido. "fija" es lo de siempre y no manda nada; las otras
   * dos traen un importe, y la fija nueva además se le guarda al vendedor para
   * que los pedidos que vengan después ya salgan con ella.
   */
  const modo = texto(formData, "comisionModo") || "fija";
  let comision: { origen: "fija" | "extraordinaria"; porBultoCentavos?: number; totalCentavos?: number } | undefined;
  if (modo !== "fija") {
    const monto = parsearMonto(texto(formData, "comisionMonto"));
    if (monto === null || monto < 0) {
      volverConError("/comercial/pedidos/nuevo", "Revisá la comisión: escribila así 500,00");
    }
    const porTodo = modo === "extraordinaria" && texto(formData, "comisionUnidad") === "total";
    comision = porTodo
      ? { origen: "extraordinaria", totalCentavos: monto }
      : { origen: modo === "nueva_fija" ? "fija" : "extraordinaria", porBultoCentavos: monto };

    if (modo === "nueva_fija") {
      const cliente = await obtenerCliente(clienteId);
      if (cliente?.vendedorId) await actualizarVendedor(cliente.vendedorId, { comisionPorBultoCentavos: monto });
    }
  }

  try {
    const id = await crearPedido({
      clienteId,
      comision,
      fecha: texto(formData, "fecha") || hoy(),
      notas: texto(formData, "notas"),
      origen: "admin",
      creadoPor: "Administración",
      formaPago: texto(formData, "formaPago") || "efectivo",
      fechaEntrega: texto(formData, "fechaEntrega") || null,
      tipoEntrega: texto(formData, "tipoEntrega") || "reparto propio",
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
  await anotar({ actor: "admin", accion: `Pedido a ${estado}`, entidad: "pedido", entidadId: id });
  refrescarTodo();
}

export async function accionEliminarPedido(formData: FormData) {
  await requerirAdmin();
  const id = texto(formData, "id");
  const deshecho = await eliminarPedido(id);

  // Del pedido no queda nada, así que el detalle de la bitácora es el único
  // lugar donde después se puede leer qué se llevó puesto al borrarlo.
  const detalle = deshecho
    ? [
        `#${deshecho.numero}`,
        `${deshecho.unidades} unidades`,
        deshecho.devueltoCentavos > 0 ? `salieron ${formatearPesos(deshecho.devueltoCentavos)} de la caja` : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";
  await anotar({ actor: "admin", accion: "Pedido eliminado", entidad: "pedido", entidadId: id, detalle });
  refrescarTodo();
  redirect("/comercial/pedidos");
}

// ---------- Vendedores ----------

const RUTA_VENDEDORES = "/comercial/vendedores";

/**
 * La comisión llega escrita como pesos y se guarda en centavos. Vacío es cero:
 * un sub-distribuidor no tiene comisión que cargar y no tiene por qué escribir
 * un 0 para poder guardar.
 */
function comisionDe(formData: FormData): number {
  const escrito = texto(formData, "comisionPorBulto");
  if (!escrito) return 0;
  const monto = parsearMonto(escrito);
  if (monto === null || monto < 0) {
    volverConError(RUTA_VENDEDORES, "Revisá la comisión por bulto: escribila así 500,00");
  }
  return monto;
}

export async function accionCrearVendedor(formData: FormData) {
  await requerirAdmin();
  try {
    await crearVendedor({
      nombre: texto(formData, "nombre"),
      color: texto(formData, "color"),
      modalidad: texto(formData, "modalidad") as ModalidadVendedor,
      comisionPorBultoCentavos: comisionDe(formData),
      listaPrecioId: texto(formData, "listaPrecioId") || null,
      telefono: texto(formData, "telefono"),
      notas: texto(formData, "notas"),
    });
  } catch (error) {
    if (error instanceof ErrorVendedor) volverConError(RUTA_VENDEDORES, error.message);
    throw error;
  }
  await anotar({ actor: "admin", accion: "Vendedor creado", entidad: "vendedor", detalle: texto(formData, "nombre") });
  refrescarTodo();
  redirect(RUTA_VENDEDORES);
}

export async function accionActualizarVendedor(formData: FormData) {
  await requerirAdmin();
  const id = texto(formData, "id");
  if (!id) volverConError(RUTA_VENDEDORES, "Falta el vendedor.");

  // El mismo formulario guarda y da de baja: el botón de baja manda "activo".
  const baja = formData.get("activo");
  try {
    await actualizarVendedor(id, {
      nombre: texto(formData, "nombre"),
      color: texto(formData, "color"),
      modalidad: texto(formData, "modalidad") as ModalidadVendedor,
      comisionPorBultoCentavos: comisionDe(formData),
      listaPrecioId: texto(formData, "listaPrecioId") || null,
      telefono: texto(formData, "telefono"),
      notas: texto(formData, "notas"),
      ...(baja === null ? {} : { activo: baja === "si" }),
    });
  } catch (error) {
    if (error instanceof ErrorVendedor) volverConError(RUTA_VENDEDORES, error.message);
    throw error;
  }
  await anotar({ actor: "admin", accion: "Vendedor actualizado", entidad: "vendedor", entidadId: id });
  refrescarTodo();
  redirect(RUTA_VENDEDORES);
}

export async function accionPagarComision(formData: FormData) {
  await requerirAdmin();
  const monto = parsearMonto(texto(formData, "monto"));
  if (monto === null || monto <= 0) {
    volverConError(RUTA_VENDEDORES, "Poné cuánto le pagás. Escribilo así: 12.500,00");
  }

  const vendedorId = texto(formData, "vendedorId");
  try {
    await registrarPagoComision({
      vendedorId,
      montoCentavos: monto,
      forma: texto(formData, "forma") || "efectivo",
      fecha: texto(formData, "fecha") || hoy(),
      notas: texto(formData, "notas"),
    });
  } catch (error) {
    if (error instanceof ErrorVendedor) volverConError(RUTA_VENDEDORES, error.message);
    if (error instanceof ErrorCaja) volverConError(RUTA_VENDEDORES, error.message);
    throw error;
  }
  await anotar({
    actor: "admin",
    accion: "Comisión pagada",
    entidad: "vendedor",
    entidadId: vendedorId,
    detalle: `${formatearPesos(monto)} · ${texto(formData, "forma") || "efectivo"}`,
  });
  refrescarTodo();
  redirect(RUTA_VENDEDORES);
}

export async function accionEliminarPagoComision(formData: FormData) {
  await requerirAdmin();
  const id = texto(formData, "id");
  await eliminarPagoComision(id);
  await anotar({ actor: "admin", accion: "Pago de comisión borrado", entidad: "vendedor", entidadId: id });
  refrescarTodo();
  redirect(RUTA_VENDEDORES);
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
      medioPago: medioDe(formData, "medioPago"),
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
      medioPago: medioDe(formData, "medioPago"),
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
  const id = texto(formData, "id");
  await eliminarGasto(id);
  await anotar({ actor: "admin", accion: "Gasto eliminado", entidad: "gasto", entidadId: id });
  // El gasto puede estar imputado a un pedido: se refresca toda el área.
  revalidatePath("/comercial", "layout");
}

// ---------- Proveedores ----------

export async function accionCrearProveedor(formData: FormData) {
  await requerirAdmin();
  try {
    await crearProveedor({
      nombre: texto(formData, "nombre"),
      cuit: texto(formData, "cuit"),
      condicionFiscal: texto(formData, "condicionFiscal"),
      telefono: texto(formData, "telefono"),
      email: texto(formData, "email"),
      direccion: texto(formData, "direccion"),
      notas: texto(formData, "notas"),
    });
  } catch (error) {
    if (error instanceof ErrorProveedor) volverConError("/comercial/proveedores", error.message);
    throw error;
  }
  revalidatePath("/comercial", "layout");
  redirect("/comercial/proveedores");
}

export async function accionActualizarProveedor(formData: FormData) {
  await requerirAdmin();
  const id = texto(formData, "id");
  const nombre = texto(formData, "nombre");
  if (!id || !nombre) volverConError("/comercial/proveedores", "El proveedor necesita un nombre.");

  await actualizarProveedor(id, {
    nombre,
    cuit: texto(formData, "cuit"),
    condicionFiscal: texto(formData, "condicionFiscal"),
    telefono: texto(formData, "telefono"),
    email: texto(formData, "email"),
    direccion: texto(formData, "direccion"),
    notas: texto(formData, "notas"),
    activo: formData.get("activo") !== null,
  });
  revalidatePath("/comercial", "layout");
  redirect("/comercial/proveedores");
}

// ---------- Compras ----------

/**
 * Los renglones llegan como cant_<id>, costo_<id> e iva_<id>. Solo entran a la
 * compra los que tienen cantidad: el resto de la grilla queda vacío a propósito.
 */
function renglonesDeFormulario(formData: FormData, destino: string) {
  const items: { productoId: string; cantidad: number; costoUnitNetoCentavos: number; ivaAlicuota: number }[] = [];

  for (const [clave, valor] of formData.entries()) {
    if (!clave.startsWith("cant_")) continue;
    const productoId = clave.slice(5);
    const cantidad = parsearEntero(String(valor).trim() || "0");
    if (cantidad === null) volverConError(destino, "Hay una cantidad que no es un número entero.");
    if (cantidad <= 0) continue;

    const costo = parsearMonto(String(formData.get(`costo_${productoId}`) ?? "").trim() || "0");
    if (costo === null || costo < 0) {
      volverConError(destino, "Revisá el costo unitario: escribilo así 4.500,00");
    }
    const alicuota = parsearEntero(String(formData.get(`iva_${productoId}`) ?? "2100").trim() || "2100");
    if (alicuota === null || alicuota < 0) volverConError(destino, "La alícuota de IVA no se entiende.");

    items.push({ productoId, cantidad, costoUnitNetoCentavos: costo, ivaAlicuota: alicuota });
  }
  return items;
}

export async function accionCrearCompra(formData: FormData) {
  await requerirAdmin();
  const destino = "/comercial/compras/nueva";
  const proveedorId = texto(formData, "proveedorId");
  if (!proveedorId) volverConError(destino, "Elegí a qué proveedor le compraste.");

  const percepciones = parsearMonto(texto(formData, "percepciones") || "0");
  const otros = parsearMonto(texto(formData, "otros") || "0");
  if (percepciones === null || otros === null) volverConError(destino, "Revisá percepciones y otros costos.");

  let id: string;
  try {
    id = await crearCompra({
      proveedorId,
      fecha: texto(formData, "fecha") || hoy(),
      comprobante: texto(formData, "comprobante"),
      formaPago: texto(formData, "formaPago") || "transferencia",
      percepcionesCentavos: percepciones,
      otrosCentavos: otros,
      notas: texto(formData, "notas"),
      items: renglonesDeFormulario(formData, destino),
    });
  } catch (error) {
    if (error instanceof ErrorCompra) volverConError(destino, error.message);
    throw error;
  }
  refrescarTodo();
  redirect(`/comercial/compras/${id}`);
}

export async function accionConfirmarCompra(formData: FormData) {
  await requerirAdmin();
  const id = texto(formData, "id");
  try {
    await confirmarCompra(id);
  } catch (error) {
    if (error instanceof ErrorCompra) volverConError(`/comercial/compras/${id}`, error.message);
    if (error instanceof ErrorStock) volverConError(`/comercial/compras/${id}`, error.message);
    throw error;
  }
  await anotar({ actor: "admin", accion: "Compra confirmada", entidad: "compra", entidadId: id });
  refrescarTodo();
  redirect(`/comercial/compras/${id}`);
}

export async function accionAnularCompra(formData: FormData) {
  await requerirAdmin();
  const id = texto(formData, "id");
  try {
    await anularCompra(id, texto(formData, "motivo"));
  } catch (error) {
    if (error instanceof ErrorCompra) volverConError(`/comercial/compras/${id}`, error.message);
    if (error instanceof ErrorStock) volverConError(`/comercial/compras/${id}`, error.message);
    throw error;
  }
  await anotar({
    actor: "admin",
    accion: "Compra anulada",
    entidad: "compra",
    entidadId: id,
    detalle: texto(formData, "motivo"),
  });
  refrescarTodo();
  redirect(`/comercial/compras/${id}`);
}

export async function accionPagarCompra(formData: FormData) {
  await requerirAdmin();
  const id = texto(formData, "id");
  const monto = parsearMonto(texto(formData, "monto"));
  if (monto === null) volverConError(`/comercial/compras/${id}`, "El monto no se entiende. Escribilo así: 12.500,00");

  try {
    await registrarPago(id, monto);
  } catch (error) {
    if (error instanceof ErrorCompra) volverConError(`/comercial/compras/${id}`, error.message);
    throw error;
  }
  revalidatePath("/comercial", "layout");
  redirect(`/comercial/compras/${id}`);
}

export async function accionEliminarBorrador(formData: FormData) {
  await requerirAdmin();
  const id = texto(formData, "id");
  try {
    await eliminarBorrador(id);
  } catch (error) {
    if (error instanceof ErrorCompra) volverConError(`/comercial/compras/${id}`, error.message);
    throw error;
  }
  refrescarTodo();
  redirect("/comercial/compras");
}

// ---------- Precios ----------

export async function accionCrearEscala(formData: FormData) {
  await requerirAdmin();
  const desde = parsearEntero(texto(formData, "desdeCantidad") || "0");
  const precio = parsearMonto(texto(formData, "precio") || "0");
  if (desde === null) volverConError("/comercial/precios", "La cantidad de corte tiene que ser un entero.");
  if (precio === null) volverConError("/comercial/precios", "El precio no se entiende. Escribilo así: 6.500,00");

  try {
    await crearEscala({
      listaId: texto(formData, "listaId"),
      productoId: texto(formData, "productoId"),
      nombre: texto(formData, "nombre"),
      desdeCantidad: desde,
      precioCentavos: precio,
    });
  } catch (error) {
    if (error instanceof ErrorPrecio) volverConError("/comercial/precios", error.message);
    throw error;
  }
  refrescarTodo();
  redirect("/comercial/precios");
}

export async function accionActualizarEscala(formData: FormData) {
  await requerirAdmin();
  const precio = parsearMonto(texto(formData, "precio") || "0");
  const desde = parsearEntero(texto(formData, "desdeCantidad") || "0");
  if (precio === null || desde === null) volverConError("/comercial/precios", "Revisá la cantidad y el precio.");

  try {
    await actualizarEscala(texto(formData, "id"), {
      nombre: texto(formData, "nombre"),
      desdeCantidad: desde,
      precioCentavos: precio,
      activo: formData.get("activo") !== null,
    });
  } catch (error) {
    if (error instanceof ErrorPrecio) volverConError("/comercial/precios", error.message);
    throw error;
  }
  refrescarTodo();
  redirect("/comercial/precios");
}

export async function accionEliminarEscala(formData: FormData) {
  await requerirAdmin();
  await eliminarEscala(texto(formData, "id"));
  refrescarTodo();
  redirect("/comercial/precios");
}

export async function accionGuardarRegimen(formData: FormData) {
  await requerirAdmin();
  const regimen = texto(formData, "regimen") as Regimen;
  await guardarRegimen(regimen);
  await anotar({ actor: "admin", accion: "Cambio de régimen fiscal", entidad: "configuración", detalle: regimen });
  revalidatePath("/comercial", "layout");
  redirect("/comercial/precios");
}

// ---------- Listas de precio ----------

export async function accionCrearLista(formData: FormData) {
  await requerirAdmin();
  try {
    await crearLista(texto(formData, "nombre"));
  } catch (error) {
    if (error instanceof ErrorPrecio) volverConError("/comercial/precios", error.message);
    throw error;
  }
  refrescarTodo();
  redirect("/comercial/precios");
}

export async function accionActualizarLista(formData: FormData) {
  await requerirAdmin();
  await actualizarLista(texto(formData, "id"), {
    nombre: texto(formData, "nombre"),
    activo: formData.get("activo") !== null,
  });
  refrescarTodo();
  redirect("/comercial/precios");
}

export async function accionMarcarPredeterminada(formData: FormData) {
  await requerirAdmin();
  await marcarPredeterminada(texto(formData, "id"));
  refrescarTodo();
  redirect("/comercial/precios");
}

export async function accionEliminarLista(formData: FormData) {
  await requerirAdmin();
  try {
    await eliminarLista(texto(formData, "id"));
  } catch (error) {
    if (error instanceof ErrorPrecio) volverConError("/comercial/precios", error.message);
    throw error;
  }
  refrescarTodo();
  redirect("/comercial/precios");
}

// ---------- Cobranza ----------

export async function accionCobrarPedido(formData: FormData) {
  await requerirAdmin();
  const id = texto(formData, "id");
  const destino = `/comercial/pedidos/${id}`;
  const monto = parsearMonto(texto(formData, "monto"));
  if (monto === null) volverConError(destino, "El monto no se entiende. Escribilo así: 12.500,00");

  try {
    await registrarCobro({
      pedidoId: id,
      montoCentavos: monto,
      forma: texto(formData, "forma") || "efectivo",
      fecha: texto(formData, "fecha") || hoy(),
    });
  } catch (error) {
    if (error instanceof ErrorPedido) volverConError(destino, error.message);
    if (error instanceof ErrorCaja) volverConError(destino, error.message);
    throw error;
  }
  revalidatePath("/comercial", "layout");
  redirect(destino);
}

export async function accionFormaPagoPedido(formData: FormData) {
  await requerirAdmin();
  const id = texto(formData, "id");
  await actualizarFormaPago(id, texto(formData, "formaPago"));
  revalidatePath(`/comercial/pedidos/${id}`);
  redirect(`/comercial/pedidos/${id}`);
}

// ---------- Caja ----------

/** Solo hay dos medios; cualquier otra cosa que llegue del formulario es efectivo. */
function medioDe(formData: FormData, campo: string): MedioPago {
  return texto(formData, campo) === "banco" ? "banco" : "efectivo";
}

export async function accionMovimientoCaja(formData: FormData) {
  await requerirAdmin();
  const monto = parsearMonto(texto(formData, "monto"));
  if (monto === null || monto <= 0) volverConError("/comercial/caja", "Poné un importe mayor a cero.");

  try {
    await registrarManual({
      // El signo lo elige el usuario con el selector de entrada o salida.
      montoCentavos: texto(formData, "sentido") === "egreso" ? -monto : monto,
      medio: medioDe(formData, "medio"),
      concepto: texto(formData, "concepto"),
      fecha: texto(formData, "fecha") || hoy(),
    });
  } catch (error) {
    if (error instanceof ErrorCaja) volverConError("/comercial/caja", error.message);
    throw error;
  }
  revalidatePath("/comercial", "layout");
  redirect("/comercial/caja");
}

export async function accionTransferirCaja(formData: FormData) {
  await requerirAdmin();
  const monto = parsearMonto(texto(formData, "monto"));
  if (monto === null || monto <= 0) volverConError("/comercial/caja", "Poné un importe mayor a cero.");

  const desde = medioDe(formData, "desde");
  try {
    await transferir({
      desde,
      hacia: desde === "efectivo" ? "banco" : "efectivo",
      montoCentavos: monto,
      fecha: texto(formData, "fecha") || hoy(),
    });
  } catch (error) {
    if (error instanceof ErrorCaja) volverConError("/comercial/caja", error.message);
    throw error;
  }
  revalidatePath("/comercial", "layout");
  redirect("/comercial/caja");
}

export async function accionEliminarMovimientoCaja(formData: FormData) {
  await requerirAdmin();
  try {
    await eliminarMovimiento(texto(formData, "id"));
  } catch (error) {
    if (error instanceof ErrorCaja) volverConError("/comercial/caja", error.message);
    throw error;
  }
  revalidatePath("/comercial", "layout");
  redirect("/comercial/caja");
}

// ---------- Ajustes de impuestos y reposición ----------

/**
 * Las alícuotas se escriben en porcentaje ("21", "3,5") y se guardan en
 * centésimos de punto, que es como las usa el cálculo.
 */
function alicuotaDe(formData: FormData, campo: string): number | null {
  const escrito = texto(formData, campo);
  if (!escrito) return null;
  const centavos = parsearMonto(escrito);
  return centavos === null || centavos < 0 ? null : centavos;
}

export async function accionGuardarImpuestos(formData: FormData) {
  await requerirAdmin();

  const ventas = alicuotaDe(formData, "alicuotaVentas");
  const iibb = alicuotaDe(formData, "alicuotaIIBB");
  const dias = parsearEntero(texto(formData, "diasDeCobertura") || "30");
  if (ventas === null || iibb === null) volverConError("/comercial/reportes", "Revisá las alícuotas: van en porcentaje, por ejemplo 21 o 3,5.");
  if (dias === null || dias <= 0) volverConError("/comercial/reportes", "Los días de cobertura tienen que ser un entero mayor a cero.");

  await guardarNumero("alicuotaVentas", ventas);
  await guardarNumero("alicuotaIIBB", iibb);
  await guardarNumero("diasDeCobertura", dias);
  await guardarPreciosConIva(texto(formData, "preciosConIva") !== "0");

  refrescarTodo();
  redirect("/comercial/reportes");
}

// ---------- Entrega ----------

export async function accionActualizarEntrega(formData: FormData) {
  await requerirAdmin();
  const id = texto(formData, "id");
  await actualizarEntrega(id, {
    fechaEntrega: texto(formData, "fechaEntrega") || null,
    tipoEntrega: texto(formData, "tipoEntrega"),
    notas: texto(formData, "notas"),
  });
  revalidatePath("/comercial", "layout");
  redirect(`/comercial/pedidos/${id}`);
}

/**
 * Costo y precio de catálogo. Viven acá y no en el depósito: el depósito cuenta
 * mercadería, y su formulario ni siquiera trae estos campos.
 *
 * El costo lo recalculan las compras confirmadas —es un promedio ponderado—, así
 * que editarlo a mano sirve sobre todo para arrancar, antes de la primera compra.
 */
export async function accionPrecioDeCatalogo(formData: FormData) {
  await requerirAdmin();
  const id = texto(formData, "id");
  const precio = parsearMonto(texto(formData, "precio") || "0");
  const costo = parsearMonto(texto(formData, "costo") || "0");
  if (precio === null || precio < 0 || costo === null || costo < 0) {
    volverConError("/comercial/precios", "Revisá el costo y el precio: escribilos así 7.500,00");
  }

  const antes = await obtenerProducto(id);
  if (!antes) volverConError("/comercial/precios", "Ese producto ya no existe.");

  await actualizarProducto(id, { precioCentavos: precio, costoCentavos: costo });

  if (precio !== antes.precioCentavos || costo !== antes.costoCentavos) {
    await anotar({
      actor: "admin",
      accion: "Cambio de costo o precio",
      entidad: "producto",
      entidadId: id,
      detalle:
        `${antes.nombre}: costo ${(antes.costoCentavos / 100).toFixed(2)} → ${(costo / 100).toFixed(2)}, ` +
        `precio ${(antes.precioCentavos / 100).toFixed(2)} → ${(precio / 100).toFixed(2)}`,
    });
  }

  refrescarTodo();
  redirect("/comercial/precios");
}
