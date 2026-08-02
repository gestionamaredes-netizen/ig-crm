export type OrigenCarga = "operativa" | "bancaria";

export type Carga = {
  id: string;
  fecha: string;
  runnerId: string | null;
  origen: OrigenCarga;
  sourceId: string;
  titular: string;
  etiqueta: string;
  pesosCargados: number;
  usdComprados: number;
  usdRetirados: number;
};

export type TotalCargas = { pesosCargados: number; usdComprados: number; usdRetirados: number; cantidad: number };
export type SubtotalCuenta = {
  clave: string; titular: string; etiqueta: string;
  pesosCargados: number; usdComprados: number; usdRetirados: number; cantidad: number;
};

export function claveCarga(origen: OrigenCarga, sourceId: string): string {
  return `${origen}:${sourceId}`;
}

export function totalDeCargas(cargas: Carga[]): TotalCargas {
  return cargas.reduce(
    (t, c) => ({
      pesosCargados: t.pesosCargados + c.pesosCargados,
      usdComprados: t.usdComprados + c.usdComprados,
      usdRetirados: t.usdRetirados + c.usdRetirados,
      cantidad: t.cantidad + 1,
    }),
    { pesosCargados: 0, usdComprados: 0, usdRetirados: 0, cantidad: 0 },
  );
}

export function subtotalPorCuenta(cargas: Carga[]): SubtotalCuenta[] {
  const acc = new Map<string, SubtotalCuenta>();
  for (const c of cargas) {
    const clave = claveCarga(c.origen, c.sourceId);
    const f = acc.get(clave) ?? {
      clave, titular: c.titular, etiqueta: c.etiqueta,
      pesosCargados: 0, usdComprados: 0, usdRetirados: 0, cantidad: 0,
    };
    f.pesosCargados += c.pesosCargados;
    f.usdComprados += c.usdComprados;
    f.usdRetirados += c.usdRetirados;
    f.cantidad += 1;
    acc.set(clave, f);
  }
  return [...acc.values()].sort((a, b) => b.pesosCargados - a.pesosCargados);
}
