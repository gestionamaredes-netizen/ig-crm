import type { Gasto, ResumenGastos, Vencimiento } from "./tipos";

const DIAS_ROJO = 7;
const DIAS_AMBAR = 30;
const MS_POR_DIA = 86_400_000;

function total(gastos: Gasto[]): number {
  return gastos.reduce((s, g) => s + g.monto, 0);
}

export function sumarPagados(gastos: Gasto[]): number {
  return total(gastos.filter((g) => g.pagadoEl !== null));
}

export function sumarPendientes(gastos: Gasto[]): number {
  return total(gastos.filter((g) => g.pagadoEl === null));
}

/** Primer día del mes de `hoy`, en YYYY-MM-DD. */
function inicioDeMes(hoy: string): string {
  return `${hoy.slice(0, 7)}-01`;
}

export function sumarDelMes(gastos: Gasto[], hoy: string): number {
  const desde = inicioDeMes(hoy);
  return total(gastos.filter((g) => g.pagadoEl !== null && g.pagadoEl >= desde));
}

/**
 * Lo ya vencido también suma: una renovación impaga no desaparece por haberse
 * pasado de fecha, y dejarla afuera del KPI la volvería invisible justo cuando
 * más urge.
 */
export function sumarPorVencer(gastos: Gasto[], hoy: string, dentroDeDias = DIAS_AMBAR): number {
  return total(
    gastos.filter((g) => g.renuevaEl !== null && diasHasta(g.renuevaEl, hoy) <= dentroDeDias),
  );
}

export function costoUnitario(monto: number, cantidad: number): number | null {
  return cantidad > 0 ? monto / cantidad : null;
}

/**
 * Las fechas son YYYY-MM-DD y se interpretan como UTC, así que el cálculo no
 * entra en zonas horarias ni en horario de verano.
 */
export function diasHasta(fecha: string, hoy: string): number {
  const ms = Date.parse(`${fecha}T00:00:00Z`) - Date.parse(`${hoy}T00:00:00Z`);
  return Math.round(ms / MS_POR_DIA);
}

function plural(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

export function estadoDeVencimiento(renuevaEl: string | null, hoy: string): Vencimiento | null {
  if (renuevaEl === null) return null;

  const dias = diasHasta(renuevaEl, hoy);
  if (dias < 0) return { tono: "rojo", etiqueta: `Vencido hace ${plural(-dias, "día", "días")}`, dias };
  if (dias === 0) return { tono: "rojo", etiqueta: "Vence hoy", dias };

  const etiqueta = `Vence en ${plural(dias, "día", "días")}`;
  if (dias <= DIAS_ROJO) return { tono: "rojo", etiqueta, dias };
  if (dias <= DIAS_AMBAR) return { tono: "ambar", etiqueta, dias };
  return { tono: "gris", etiqueta, dias };
}

/**
 * `costoDePauta` viene de `campaign_metrics`, o sea gasto ejecutado y reportado.
 * No es el presupuesto de las campañas: mostrar el presupuesto como si fuera
 * gasto infla el total con plata que todavía no se gastó.
 */
export function resumir(gastos: Gasto[], costoDePauta: number, hoy: string): ResumenGastos {
  return {
    total: sumarPagados(gastos) + costoDePauta,
    delMes: sumarDelMes(gastos, hoy) + costoDePauta,
    porVencer: sumarPorVencer(gastos, hoy),
    pendiente: sumarPendientes(gastos),
  };
}
