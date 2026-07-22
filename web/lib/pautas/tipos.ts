export type Plataforma = "google" | "meta";
export type EstadoCampana = "borrador" | "activa" | "pausada" | "finalizada";
export type OrigenMetrica = "manual" | "sync";

/** Un tramo de performance. `desde` y `hasta` son YYYY-MM-DD y `hasta` es inclusivo. */
export type PeriodoMetrica = {
  id: string;
  campanaId: string;
  desde: string;
  hasta: string;
  origen: OrigenMetrica;
  impresiones: number;
  clics: number;
  costo: number;
  /** Conversiones que reporta la plataforma (clics a wa.me). NO son leads del CRM. */
  clicsWhatsapp: number;
};

export type TotalesPauta = {
  impresiones: number;
  clics: number;
  costo: number;
  clicsWhatsapp: number;
};

/** Todo puede ser null: sin denominador no hay ratio que valga. */
export type MetricasDerivadas = {
  ctr: number | null;
  costoPorClic: number | null;
  costoPorClicWhatsapp: number | null;
  costoPorLead: number | null;
};

export type RangoFechas = { desde: string; hasta: string };
