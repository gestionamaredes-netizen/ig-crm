import type { OperacionCalculada } from "./calculo";
import type { Caja, Moneda } from "./tipos";

export type SaldoCaja = {
  id: string;
  nombre: string;
  moneda: Moneda;
  saldoInicial: number;
  movimientos: number;
  ajuste: number;
  saldo: number;
};

export type FilaCliente = {
  cliente: string;
  usdComprados: number;
  usdVendidos: number;
  volumen: number;
  margen: number;
  tcPromedioCompra: number;
  tcPromedioVenta: number;
  operaciones: number;
};

export type FilaPersona = {
  persona: string;
  comoEmisor: number;
  comoReceptor: number;
  volumen: number;
  operaciones: number;
};

export type ResumenCambio = {
  stockUsd: number;
  costoPromedio: number;
  costoTotal: number;
  margenTotal: number;
  margenDelMes: number;
  /** Total de comisiones por uso de cuenta, separado del margen (spread). */
  comisiones: number;
  comisionesDelMes: number;
  volumenUsd: number;
  operaciones: number;
};

/**
 * Movimientos de cada caja. Una caja sin movimientos aparece igual, en su
 * saldo inicial: omitirla la haría ver como si no existiera.
 */
export function saldosDeCajas(ops: OperacionCalculada[], cajas: Caja[]): SaldoCaja[] {
  return cajas.map((caja) => {
    let movimientos = 0;
    for (const op of ops) {
      if (caja.moneda === "ARS" && op.cajaArsId === caja.id) {
        // En una venta entran pesos, en una compra salen. Los costos siempre
        // salen de la caja de pesos. Una carga en USD es stock propio en
        // dólares: no mueve pesos, así que no lleva cajaArsId y nunca entra
        // acá. Una carga en pesos SÍ lleva cajaArsId: es una inyección de
        // capital a esta caja, así que suma +ars igual que una venta.
        movimientos += (op.tipo === "venta" || op.tipo === "carga" ? op.ars : op.tipo === "compra" ? -op.ars : 0) - op.costos;
      } else if (caja.moneda === "USD" && op.cajaUsdId === caja.id) {
        // La carga entra dólares al stock igual que una compra.
        movimientos += op.tipo === "compra" || op.tipo === "carga" ? op.usd : -op.usd;
      }
      // Un canje mueve dos cajas propias, de cualquier moneda, sin convertir:
      // entra tal cual a `canjeInId` y sale tal cual de `canjeOutId`. Una
      // operación de canje trae cajaArsId/cajaUsdId en null, así que nunca
      // entra a las dos ramas de arriba; esto es lo único que la cuenta.
      if (op.canjeInId === caja.id) movimientos += op.canjeInMonto;
      if (op.canjeOutId === caja.id) movimientos -= op.canjeOutMonto;
    }
    return {
      id: caja.id,
      nombre: caja.nombre,
      moneda: caja.moneda,
      saldoInicial: caja.saldoInicial,
      movimientos,
      ajuste: caja.ajuste,
      saldo: caja.saldoInicial + movimientos + caja.ajuste,
    };
  });
}

/** El margen es de la relación comercial, así que se atribuye al cliente. */
export function rankingClientes(ops: OperacionCalculada[]): FilaCliente[] {
  const acc = new Map<string, FilaCliente & { arsCompra: number; arsVenta: number }>();

  for (const op of ops) {
    // La carga es stock propio y el canje mueve cajas propias: ninguno de
    // los dos tiene cliente ni margen, así que no son operaciones
    // comerciales y no deben sumar una fila.
    if (op.tipo === "carga" || op.tipo === "canje") continue;
    const clave = op.cliente.trim() || "(sin cliente)";
    const f = acc.get(clave) ?? {
      cliente: clave, usdComprados: 0, usdVendidos: 0, volumen: 0, margen: 0,
      tcPromedioCompra: 0, tcPromedioVenta: 0, operaciones: 0, arsCompra: 0, arsVenta: 0,
    };
    f.operaciones += 1;
    f.margen += op.margen;
    if (op.tipo === "compra") {
      f.usdComprados += op.usd;
      f.arsCompra += op.ars;
    } else {
      f.usdVendidos += op.usd;
      f.arsVenta += op.ars;
    }
    acc.set(clave, f);
  }

  return [...acc.values()]
    .map((f) => ({
      cliente: f.cliente,
      usdComprados: f.usdComprados,
      usdVendidos: f.usdVendidos,
      volumen: f.usdComprados + f.usdVendidos,
      margen: f.margen,
      // Promedio ponderado por monto, no de los TC sueltos: una operación de
      // 10.000 pesa más que una de 100 al describir a qué precio se opera.
      tcPromedioCompra: f.usdComprados > 0 ? f.arsCompra / f.usdComprados : 0,
      tcPromedioVenta: f.usdVendidos > 0 ? f.arsVenta / f.usdVendidos : 0,
      operaciones: f.operaciones,
    }))
    .sort((a, b) => b.volumen - a.volumen);
}

/**
 * Emisores y receptores se escriben a mano, así que "Ana Perez" y
 * "ana perez " son la misma persona y tienen que sumar en una sola fila. Se
 * agrupa por el nombre normalizado y se muestra la primera forma escrita.
 */
export function rankingPersonas(ops: OperacionCalculada[]): FilaPersona[] {
  const acc = new Map<string, FilaPersona & { idsOperaciones: Set<string> }>();

  const sumar = (nombre: string, usd: number, rol: "emisor" | "receptor", idOperacion: string) => {
    const limpio = nombre.trim();
    if (!limpio) return;
    const clave = limpio.toLowerCase();
    const f = acc.get(clave) ?? {
      persona: limpio, comoEmisor: 0, comoReceptor: 0, volumen: 0, operaciones: 0,
      idsOperaciones: new Set<string>(),
    };
    if (rol === "emisor") f.comoEmisor += usd;
    else f.comoReceptor += usd;
    // Volumen y operaciones cuentan OPERACIONES, no roles. Cuando el cliente
    // opera para sí mismo (manda los dólares y recibe los pesos él), es
    // emisor y receptor de la MISMA operación real: eso no la convierte en
    // dos operaciones, así que solo se suma la primera vez que esta persona
    // aparece en este `id` de operación, sin importar en qué rol.
    if (!f.idsOperaciones.has(idOperacion)) {
      f.idsOperaciones.add(idOperacion);
      f.volumen += usd;
      f.operaciones += 1;
    }
    acc.set(clave, f);
  };

  for (const op of ops) {
    // El canje no es una operación de trading con emisor/receptor comercial:
    // no debe sumar filas ni operaciones al ranking de personas (igual que en
    // rankingClientes).
    if (op.tipo === "canje") continue;
    sumar(op.emisor, op.usd, "emisor", op.id);
    sumar(op.receptor, op.usd, "receptor", op.id);
  }

  return [...acc.values()]
    .map((f): FilaPersona => ({
      persona: f.persona, comoEmisor: f.comoEmisor, comoReceptor: f.comoReceptor,
      volumen: f.volumen, operaciones: f.operaciones,
    }))
    .sort((a, b) => b.volumen - a.volumen);
}

export function resumir(ops: OperacionCalculada[], hoy: string): ResumenCambio {
  // `calcular` ya devolvió las operaciones ordenadas, así que el stock y el
  // costo promedio vigentes son los de la última.
  const ultima = ops[ops.length - 1];
  const inicioDeMes = `${hoy.slice(0, 7)}-01`;

  return {
    stockUsd: ultima?.stock ?? 0,
    costoPromedio: ultima?.costoPromedio ?? 0,
    costoTotal: ultima?.costoTotal ?? 0,
    margenTotal: ops.reduce((s, o) => s + o.margen, 0),
    margenDelMes: ops.filter((o) => o.fecha >= inicioDeMes).reduce((s, o) => s + o.margen, 0),
    // Las comisiones son un total aparte del margen: no se restan de él
    // (ver calculo.ts), así que se suman acá directamente desde op.costos.
    comisiones: ops.reduce((s, o) => s + o.costos, 0),
    comisionesDelMes: ops.filter((o) => o.fecha >= inicioDeMes).reduce((s, o) => s + o.costos, 0),
    // La carga engrosa el stock (por eso stockUsd la refleja) pero no es
    // volumen operado: no hubo una compra ni una venta con un cliente. El
    // canje tampoco: mueve cajas, no dólares de trading (su `usd` es 0).
    volumenUsd: ops.filter((o) => o.tipo !== "carga" && o.tipo !== "canje").reduce((s, o) => s + o.usd, 0),
    operaciones: ops.length,
  };
}
