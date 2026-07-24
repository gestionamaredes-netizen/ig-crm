export type TipoOperacion = "compra" | "venta" | "carga";
export type Moneda = "ARS" | "USD";

/** Las fechas son YYYY-MM-DD: comparar strings equivale a comparar cronológicamente. */
export type Operacion = {
  id: string;
  fecha: string;
  /** Desempate estable entre operaciones del mismo día. ISO 8601. */
  creadaEn: string;
  tipo: TipoOperacion;
  /** null = la operación quedó sin cliente (el cliente se borró). */
  clienteId: string | null;
  cliente: string;
  emisor: string;
  receptor: string;
  /** El único importe que se guarda. Los USD y los pesos se derivan de acá. */
  monto: number;
  /** En qué moneda está `monto`. */
  moneda: Moneda;
  /** Pesos por dólar. */
  tc: number;
  cajaArsId: string | null;
  cajaUsdId: string | null;
  costos: number;
  notas: string;
  /** Ruta del comprobante en Storage. '' = sin comprobante. */
  comprobantePath: string;
};

export type Caja = {
  id: string;
  nombre: string;
  moneda: Moneda;
  saldoInicial: number;
  ajuste: number;
};

export type ClienteCambio = { id: string; nombre: string };
