import type { OrdenDelDiaRegistro } from "@/lib/cambio/orden-del-dia";

export function generarResumenWhatsApp(
  registros: OrdenDelDiaRegistro[],
  fecha: string
): string {
  if (registros.length === 0) {
    return `CARGAS DEL ${fecha}\nSin cuentas cargadas`;
  }

  const lineas = [
    `📋 CARGAS DEL ${fecha}`,
    "",
  ];

  for (const reg of registros) {
    const estado = "✓ CARGADA";
    lineas.push(`• ${reg.alias_pesos || reg.cuenta_alias || "Cuenta"}: ${estado}`);
  }

  lineas.push("");
  lineas.push("Generado desde Gestiones MA");

  return lineas.join("\n");
}
