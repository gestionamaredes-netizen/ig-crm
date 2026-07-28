import type { Operacion, Moneda } from "./tipos";

/**
 * Un stock por debajo de esta magnitud es ruido de coma flotante, no dólares.
 * Dividir `costoTotal` por un stock de 5e-14 devuelve un costo promedio
 * absurdo, y vender exactamente todo lo comprado —cerrar posición— es
 * justamente el caso que lo dispara.
 */
const EPSILON_USD = 1e-6;

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
  // Un monto no finito (por ejemplo NaN de una importación mal armada) es el
  // mismo problema: si se propaga, contamina el stock y el costo total de
  // todas las filas siguientes en silencio.
  if (!Number.isFinite(op.tc) || op.tc <= 0 || !Number.isFinite(op.monto)) return { usd: 0, ars: 0 };
  return op.moneda === "ARS"
    ? { usd: op.monto / op.tc, ars: op.monto }
    : { usd: op.monto, ars: op.monto * op.tc };
}

/**
 * Fecha, y dentro del mismo día el orden de carga. `id` es el desempate
 * final: si `fecha` y `creadaEn` coinciden exactamente (por ejemplo, una
 * importación en lote que estampa el mismo `creadaEn` en muchas filas),
 * `sort` no es estable en todos los motores y el resultado dependería del
 * orden de entrada del array, justo lo que este módulo existe para evitar.
 */
function porFecha(a: Operacion, b: Operacion): number {
  if (a.fecha !== b.fecha) return a.fecha < b.fecha ? -1 : 1;
  if (a.creadaEn !== b.creadaEn) return a.creadaEn < b.creadaEn ? -1 : 1;
  if (a.id !== b.id) return a.id < b.id ? -1 : 1;
  return 0;
}

/**
 * Costo promedio ponderado móvil: cada compra recalcula el costo promedio de
 * todo el stock, cada venta descarga a ese costo. `op.costos` (comisiones
 * por uso de cuenta) NO participa acá: no se capitaliza en las compras ni se
 * resta del margen en las ventas. El margen es solo el spread compra/venta;
 * las comisiones se sirven aparte en `resumir` (`comisiones`,
 * `comisionesDelMes`, en reportes.ts).
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
    // Una carga en pesos es una inyección de capital a una caja de pesos, no
    // una operación de cambio: no tiene TC, así que `importes` (que asume
    // uno) no aplica acá. Es simplemente monto → ars, sin dólares.
    const esCargaPesos = op.tipo === "carga" && op.moneda === "ARS";
    const { usd, ars } = esCargaPesos ? { usd: 0, ars: op.monto } : importes(op);
    const stockPrevio = stock;
    const promedioPrevio = stockPrevio > 0 ? costoTotal / stockPrevio : ultimoPromedio;
    let margen = 0;

    if (op.tipo === "compra" || (op.tipo === "carga" && op.moneda === "USD")) {
      if (stockPrevio < 0) {
        // Vender en descubierto es un estado de error transitorio: significa
        // que falta cargar una compra. El margen de esa venta se calcula
        // contra el último costo promedio válido y NO se recalcula cuando el
        // descubierto se cubre. Al cargar la compra faltante con su fecha
        // real, el orden se recompone solo y el negativo desaparece.
        //
        // Mientras tanto, esta compra primero tapa el agujero: el descubierto
        // no es stock real, así que no se capitaliza a ningún costo. Sólo el
        // sobrante que efectivamente queda en inventario se capitaliza, y al
        // TC efectivo de ESTA operación (no al promedio previo, que ya no
        // representa nada real una vez que el stock se fue a negativo).
        const cubre = Math.min(usd, -stockPrevio);
        const neto = usd - cubre;
        costoTotal += neto * (usd > 0 ? ars / usd : 0);
      } else {
        costoTotal += ars;
      }
      stock += usd;
    } else if (esCargaPesos) {
      // Inyección de pesos a una caja de pesos: no mueve dólares, no
      // capitaliza costo, no genera margen. Stock y costoTotal quedan tal
      // cual estaban.
    } else {
      margen = ars - usd * promedioPrevio;
      costoTotal -= usd * promedioPrevio;
      stock -= usd;
    }

    // Un stock por debajo de EPSILON_USD tras vender exactamente todo el lote
    // es ruido de coma flotante (ej. 5.68e-14), no dólares reales. Cerrarlo en
    // cero evita dividir costoTotal por ese casi-cero.
    if (Math.abs(stock) < EPSILON_USD) stock = 0;

    let costoPromedio: number;
    if (stock <= 0) {
      // Sin stock no hay base de costo que arrastrar. Lo que quede en
      // costoTotal en este punto es sólo ruido de coma flotante (stock
      // cerrado en cero) o la deuda ficticia de haber vendido en descubierto
      // (stock negativo); en los dos casos arrastrarlo envenenaría el costo
      // promedio de la próxima compra. Se descarta y se conserva el último
      // promedio válido en vez de devolver cero, que se leería como "los
      // dólares no costaron nada".
      costoTotal = 0;
      costoPromedio = promedioPrevio;
    } else {
      costoPromedio = costoTotal / stock;
    }
    ultimoPromedio = costoPromedio;

    return { ...op, usd, ars, margen, stock, costoTotal, costoPromedio };
  });
}
