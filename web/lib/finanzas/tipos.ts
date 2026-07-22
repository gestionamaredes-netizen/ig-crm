export type CategoriaGasto = "dominio" | "hosting" | "herramienta" | "merch" | "servicio" | "otro";
export type PeriodoGasto = "unico" | "mensual" | "anual";
export type OrigenGasto = "manual" | "meta" | "google";

/** Las fechas son YYYY-MM-DD: comparar strings equivale a comparar cronológicamente. */
export type Gasto = {
  id: string;
  /** null = gasto de la agencia, no imputable a una empresa cliente. */
  empresaId: string | null;
  empresa: string;
  empresaColor: string;
  categoria: CategoriaGasto;
  concepto: string;
  proveedor: string;
  referencia: string;
  /** Total pagado, no unitario. El unitario sale de dividir por `cantidad`. */
  monto: number;
  cantidad: number;
  moneda: string;
  /** null = todavía no se pagó. */
  pagadoEl: string | null;
  /** null = gasto único, no renueva. */
  renuevaEl: string | null;
  periodo: PeriodoGasto;
  origen: OrigenGasto;
  notas: string;
};

export type TonoVencimiento = "rojo" | "ambar" | "gris";
export type Vencimiento = { tono: TonoVencimiento; etiqueta: string; dias: number };

export type ResumenGastos = {
  /** Operativo pagado + costo de pauta registrado. */
  total: number;
  /**
   * Gasto del mes en curso: operativo pagado en el mes + costo de pauta del
   * mes. Las dos mitades están recortadas al mismo mes — mezclar una
   * histórica con la otra la mes-limitada infla la cifra con gasto de meses
   * que ya cerraron.
   */
  delMes: number;
  porVencer: number;
  pendiente: number;
};
