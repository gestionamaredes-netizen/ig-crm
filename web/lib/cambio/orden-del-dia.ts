export type OrdenDelDiaRegistro = {
  id: string;
  fecha: string;
  cuentaId: string;
  titular: string;
  banco: string;
  runnerId: string | null;
  runnerNombre: string;
  pesosCargados: number;
  usdComprados: number;
  aliasPesos: string;
  aliasDolares: string;
  dni: string;
  pin: string;
  creadaEn: string;
};

export type CargaCuentasAuditoria = {
  id: string;
  fecha: string;
  runnerId: string | null;
  runnerNombre: string;
  cuentaId: string | null;
  titular: string;
  pesosCargados: number;
  usdComprados: number;
  accion: "crear" | "actualizar" | "eliminar";
  datosAnteriores: Record<string, unknown>;
  datosNuevos: Record<string, unknown>;
  creadaEn: string;
};

export type NuevoRegistroOrdenDelDia = {
  cuentaId: string;
  runnerId?: string;
  pesosCargados: number;
  usdComprados: number;
  aliasPesos: string;
  aliasDolares: string;
  dni: string;
  pin: string;
};
