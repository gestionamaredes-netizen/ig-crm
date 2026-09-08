import { createClient } from "@/lib/supabase/server";
import { resumirCobro, acumular, type ResumenCobro } from "./calculo";

export type TipoCliente = "unico" | "mensual";

export type FilaCliente = {
  id: string;
  nombre: string;
  tipo: TipoCliente;
  cantidadCobros: number;
  resumen: ResumenCobro;
};

export type Costo = { id: string; concepto: string; monto: number };
export type Pago = { id: string; monto: number; fecha: string; medio: string; cuenta: string };
export type CobroDetalle = {
  id: string;
  concepto: string;
  total: number;
  fecha: string;
  costos: Costo[];
  pagos: Pago[];
  resumen: ResumenCobro;
};
export type ClienteDetalle = {
  id: string;
  nombre: string;
  tipo: TipoCliente;
  notas: string;
  cobros: CobroDetalle[];
  resumen: ResumenCobro;
};

type CostoRow = { id: string; cobro_id: string; concepto: string; monto: number | string };
type PagoRow = { id: string; cobro_id: string; monto: number | string; fecha: string; medio: string; cuenta: string };

function num(v: number | string): number {
  return Number(v);
}

async function cargarTodo() {
  const sb = await createClient();
  const [{ data: clientes }, { data: cobros }, { data: costos }, { data: pagos }] = await Promise.all([
    sb.from("cobros_clientes").select("id,nombre,tipo,notas").order("nombre"),
    sb.from("cobros").select("id,cliente_id,concepto,total,fecha").order("fecha", { ascending: false }),
    sb.from("cobros_costos").select("id,cobro_id,concepto,monto"),
    sb.from("cobros_pagos").select("id,cobro_id,monto,fecha,medio,cuenta"),
  ]);
  return {
    clientes: clientes ?? [],
    cobros: cobros ?? [],
    costos: (costos ?? []) as CostoRow[],
    pagos: (pagos ?? []) as PagoRow[],
  };
}

function resumenDeCobro(cobroId: string, total: number, costos: CostoRow[], pagos: PagoRow[]): ResumenCobro {
  return resumirCobro(
    total,
    costos.filter((c) => c.cobro_id === cobroId).map((c) => ({ monto: num(c.monto) })),
    pagos.filter((p) => p.cobro_id === cobroId).map((p) => ({ monto: num(p.monto) })),
  );
}

export async function getClientes(): Promise<FilaCliente[]> {
  const { clientes, cobros, costos, pagos } = await cargarTodo();
  return clientes
    .map((cl) => {
      const propios = cobros.filter((c) => c.cliente_id === cl.id);
      const resumenes = propios.map((c) => resumenDeCobro(c.id as string, num(c.total), costos, pagos));
      return {
        id: cl.id as string,
        nombre: cl.nombre as string,
        tipo: (cl.tipo === "mensual" ? "mensual" : "unico") as TipoCliente,
        cantidadCobros: propios.length,
        resumen: acumular(resumenes),
      };
    })
    .sort((a, b) => b.resumen.saldo - a.resumen.saldo);
}

export async function getCliente(id: string): Promise<ClienteDetalle | null> {
  const { clientes, cobros, costos, pagos } = await cargarTodo();
  const cl = clientes.find((c) => c.id === id);
  if (!cl) return null;

  const propios = cobros.filter((c) => c.cliente_id === id);
  const detalle: CobroDetalle[] = propios.map((c) => {
    const cobroId = c.id as string;
    const total = num(c.total);
    return {
      id: cobroId,
      concepto: c.concepto as string,
      total,
      fecha: c.fecha as string,
      costos: costos
        .filter((x) => x.cobro_id === cobroId)
        .map((x) => ({ id: x.id, concepto: x.concepto, monto: num(x.monto) })),
      pagos: pagos
        .filter((x) => x.cobro_id === cobroId)
        .map((x) => ({ id: x.id, monto: num(x.monto), fecha: x.fecha, medio: x.medio, cuenta: x.cuenta })),
      resumen: resumenDeCobro(cobroId, total, costos, pagos),
    };
  });

  return {
    id: cl.id as string,
    nombre: cl.nombre as string,
    tipo: (cl.tipo === "mensual" ? "mensual" : "unico") as TipoCliente,
    notas: (cl.notas as string) ?? "",
    cobros: detalle,
    resumen: acumular(detalle.map((d) => d.resumen)),
  };
}
