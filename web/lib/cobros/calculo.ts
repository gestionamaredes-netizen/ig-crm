// Reparto y saldo de un cobro de la agencia. Todo derivado: nada se guarda
// calculado, se recomputa al leer.

/** Reparto de la ganancia entre los dos socios. "Marcelo siempre el 30%". */
export const REPARTO = { marcelo: 0.3, fabricio: 0.7 } as const;

export type LineaCosto = { monto: number };
export type LineaPago = { monto: number };

export type ResumenCobro = {
  total: number;
  costos: number;
  /** total − costos. Puede ser negativa (pérdida): se muestra, no se esconde. */
  ganancia: number;
  marcelo: number;
  fabricio: number;
  pagado: number;
  /** total − pagado. Negativo = pagó de más. */
  saldo: number;
};

export function resumirCobro(total: number, costos: LineaCosto[], pagos: LineaPago[]): ResumenCobro {
  const costosTotal = costos.reduce((s, c) => s + c.monto, 0);
  const ganancia = total - costosTotal;
  const pagado = pagos.reduce((s, p) => s + p.monto, 0);
  return {
    total,
    costos: costosTotal,
    ganancia,
    marcelo: ganancia * REPARTO.marcelo,
    fabricio: ganancia * REPARTO.fabricio,
    pagado,
    saldo: total - pagado,
  };
}

/** Suma de resúmenes de varios cobros (para el total de un cliente). */
export function acumular(resumenes: ResumenCobro[]): ResumenCobro {
  return resumenes.reduce<ResumenCobro>(
    (a, r) => ({
      total: a.total + r.total,
      costos: a.costos + r.costos,
      ganancia: a.ganancia + r.ganancia,
      marcelo: a.marcelo + r.marcelo,
      fabricio: a.fabricio + r.fabricio,
      pagado: a.pagado + r.pagado,
      saldo: a.saldo + r.saldo,
    }),
    { total: 0, costos: 0, ganancia: 0, marcelo: 0, fabricio: 0, pagado: 0, saldo: 0 },
  );
}
