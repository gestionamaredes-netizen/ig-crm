import type { Moneda } from "./tipos";

export type Runner = { id: string; nombre: string; activo: boolean };

export type CuentaGestion = { id: string; nombre: string; moneda: Moneda; pago: number; activa: boolean };

export type TipoGestion = "retiro" | "transferencia";

export type Gestion = { id: string; fecha: string; runnerId: string; cuentaId: string; cuenta: string; tipo: TipoGestion; monto: number; pago: number; notas: string };

export type PagoRunner = { id: string; fecha: string; runnerId: string; monto: number; notas: string };

export type SaldoRunner = { id: string; nombre: string; activo: boolean; gestionado: number; pagado: number; pendiente: number };

export function calcularRunners(runners: Runner[], gestiones: Gestion[], pagos: PagoRunner[]): SaldoRunner[] {
  return runners.map((r) => {
    const gestionado = gestiones.filter((g) => g.runnerId === r.id).reduce((a, g) => a + g.pago, 0);
    const pagado = pagos.filter((p) => p.runnerId === r.id).reduce((a, p) => a + p.monto, 0);
    return { id: r.id, nombre: r.nombre, activo: r.activo, gestionado, pagado, pendiente: gestionado - pagado };
  });
}
