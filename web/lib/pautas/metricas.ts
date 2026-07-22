import type { PeriodoMetrica, TotalesPauta, MetricasDerivadas, RangoFechas } from "./tipos";

export function sumarPeriodos(periodos: PeriodoMetrica[]): TotalesPauta {
  return periodos.reduce<TotalesPauta>(
    (acc, p) => ({
      impresiones: acc.impresiones + p.impresiones,
      clics: acc.clics + p.clics,
      costo: acc.costo + p.costo,
      clicsWhatsapp: acc.clicsWhatsapp + p.clicsWhatsapp,
    }),
    { impresiones: 0, clics: 0, costo: 0, clicsWhatsapp: 0 },
  );
}

/** Sin denominador no hay ratio: devolvemos null y la UI muestra un guion. */
function ratio(numerador: number, denominador: number): number | null {
  return denominador > 0 ? numerador / denominador : null;
}

export function derivar(totales: TotalesPauta, leadsAtribuidos: number): MetricasDerivadas {
  return {
    ctr: ratio(totales.clics, totales.impresiones),
    costoPorClic: ratio(totales.costo, totales.clics),
    costoPorClicWhatsapp: ratio(totales.costo, totales.clicsWhatsapp),
    costoPorLead: ratio(totales.costo, leadsAtribuidos),
  };
}

/**
 * Las fechas son YYYY-MM-DD, así que la comparación de strings equivale a la
 * cronológica y evita entrar en zonas horarias.
 */
export function seSolapan(a: RangoFechas, b: RangoFechas): boolean {
  return a.desde <= b.hasta && b.desde <= a.hasta;
}

/**
 * El dato automático manda; el manual es respaldo. Descarta las filas manuales
 * que pisen cualquier tramo traído por sync, para no contar el gasto dos veces.
 *
 * Sólo arbitra manual contra sync: dos filas de sync duplicadas serían un bug
 * del cargador, y esconderlo acá lo volvería invisible.
 */
export function periodosVigentes(periodos: PeriodoMetrica[]): PeriodoMetrica[] {
  const deSync = periodos.filter((p) => p.origen === "sync");
  return periodos.filter(
    (p) => p.origen === "sync" || !deSync.some((s) => seSolapan(p, s)),
  );
}
