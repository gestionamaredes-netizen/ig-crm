import type { Cuenta } from "./cuentas";

export type HojaRutaInput = {
  /** Nombre del runner. */
  runner: string;
  /** Día en formato ISO "YYYY-MM-DD" (solo como rótulo de la hoja). */
  dia: string;
  /** Cuentas asignadas al runner. */
  cuentas: Cuenta[];
};

const fmtFecha = (iso: string) => iso.split("-").reverse().join("/");

/**
 * Arma la hoja de ruta de un runner: las cuentas que tiene asignadas con los
 * datos OPERATIVOS para recibir/operar (banco, titular, DNI, CBU y alias en
 * pesos y dólares).
 *
 * Por diseño NO incluye `usuario` ni `clave`: las credenciales de acceso no se
 * distribuyen en texto. Es la misma decisión que ya toma `datosParaCopiar` del
 * pool bancario ("NO incluye usuario ni clave"). Se arma en el server y solo
 * viaja al cliente el texto resultante, así las credenciales nunca salen.
 */
export function textoHojaRuta({ runner, dia, cuentas }: HojaRutaInput): string {
  const L: string[] = [];
  L.push(`🗂 *HOJA DE RUTA — ${runner || "Runner"}*`);
  L.push(`📅 ${fmtFecha(dia)}`);
  L.push(`Cuentas asignadas: ${cuentas.length}`);
  L.push("");

  if (cuentas.length === 0) {
    L.push("(sin cuentas asignadas)");
    return L.join("\n");
  }

  cuentas.forEach((c, i) => {
    L.push(`${i + 1}. *${c.banco || "Banco"}* — ${c.titular || "—"}`);
    if (c.dni) L.push(`   DNI: ${c.dni}`);
    // Las 4 líneas de CBU/alias van SIEMPRE (con "—" si falta el dato), para
    // que cada cuenta muestre pesos y dólares de forma completa y visible.
    L.push(`   CBU $: ${c.cbuPesos || "—"}`);
    L.push(`   Alias $: ${c.aliasPesos || "—"}`);
    L.push(`   CBU USD: ${c.cbuDolares || "—"}`);
    L.push(`   Alias USD: ${c.aliasDolares || "—"}`);
    if (c.tarjeta) L.push(`   (opera por tarjeta)`);
    L.push("");
  });

  L.push("Esta hoja no incluye datos de acceso: usuario y clave nunca se comparten por mensaje.");
  return L.join("\n").trimEnd();
}
