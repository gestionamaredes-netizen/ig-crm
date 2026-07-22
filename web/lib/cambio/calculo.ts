import type { Operacion, Moneda } from "./tipos";

export type OperacionCalculada = Operacion & {
  /** Dólares que se movieron. */
  usd: number;
  /** Pesos que se movieron. */
  ars: number;
  /** Costo promedio del stock DESPUÉS de esta operación. */
  costoPromedio: number;
  /** Ganancia de esta operación. Cero en las compras. */
  margen: number;
  /** Stock de dólares DESPUÉS de esta operación. */
  stock: number;
  /** Costo total en pesos del stock DESPUÉS de esta operación. */
  costoTotal: number;
};

/**
 * El usuario carga UN solo importe y aclara en qué moneda está: a veces
 * conoce el monto en pesos ("recibí 452.500") y a veces en dólares ("me
 * pidieron 300"). Forzar una sola dirección obliga a dividir a mano la mitad
 * de las veces, que es lo que hacía inusable la planilla anterior.
 */
export function importes(op: { monto: number; moneda: Moneda; tc: number }): { usd: number; ars: number } {
  // Un TC en cero no es "gratis": es una fila a medio cargar. Devolver ceros
  // deja la fila neutra en vez de propagar Infinity por todo el cálculo.
  if (!Number.isFinite(op.tc) || op.tc <= 0) return { usd: 0, ars: 0 };
  return op.moneda === "ARS"
    ? { usd: op.monto / op.tc, ars: op.monto }
    : { usd: op.monto, ars: op.monto * op.tc };
}

/** Fecha, y dentro del mismo día el orden de carga. */
function porFecha(a: Operacion, b: Operacion): number {
  if (a.fecha !== b.fecha) return a.fecha < b.fecha ? -1 : 1;
  if (a.creadaEn !== b.creadaEn) return a.creadaEn < b.creadaEn ? -1 : 1;
  return 0;
}

/**
 * Costo promedio ponderado móvil: cada compra recalcula el costo promedio de
 * todo el stock, cada venta descarga a ese costo. Los costos se capitalizan
 * en las compras y se restan del margen en las ventas.
 *
 * Ordena por fecha ANTES de recorrer. En la planilla que este módulo
 * reemplaza el cálculo dependía del orden físico de las filas, así que
 * cargar una operación de ayer rompía todos los números de abajo en
 * silencio. Acá el orden de carga es irrelevante.
 */
export function calcular(ops: Operacion[]): OperacionCalculada[] {
  const ordenadas = [...ops].sort(porFecha);

  let stock = 0;
  let costoTotal = 0;
  let ultimoPromedio = 0;

  return ordenadas.map((op) => {
    const { usd, ars } = importes(op);
    const promedioPrevio = stock > 0 ? costoTotal / stock : ultimoPromedio;
    let margen = 0;

    if (op.tipo === "compra") {
      stock += usd;
      costoTotal += ars + op.costos;
    } else {
      margen = ars - usd * promedioPrevio - op.costos;
      costoTotal -= usd * promedioPrevio;
      stock -= usd;
    }

    // Sin stock no hay promedio que calcular: se conserva el último válido en
    // vez de devolver cero, que se leería como "los dólares no costaron nada".
    const costoPromedio = stock > 0 ? costoTotal / stock : promedioPrevio;
    ultimoPromedio = costoPromedio;

    return { ...op, usd, ars, margen, stock, costoTotal, costoPromedio };
  });
}
