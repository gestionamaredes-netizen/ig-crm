import type { EstadoCampana } from "./tipos";

export type Frescura = { etiqueta: string; tono: "gris" | "ambar" | "neutro" };

const HORAS_PARA_ALARMA = 48;

function plural(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

function antiguedad(horas: number): string {
  if (horas < 1) return plural(Math.max(1, Math.round(horas * 60)), "minuto", "minutos");
  if (horas < 24) return plural(Math.floor(horas), "hora", "horas");
  return plural(Math.floor(horas / 24), "día", "días");
}

/**
 * El modo de falla peligroso no es que el sync explote: es que falle en silencio
 * y los números viejos pasen por actuales. Por eso cada card muestra su antigüedad.
 */
export function estadoDeFrescura(
  ultimaCarga: Date | null,
  ahora: Date,
  estado: EstadoCampana,
): Frescura {
  if (estado === "borrador") return { etiqueta: "En borrador", tono: "neutro" };
  if (!ultimaCarga) return { etiqueta: "Sin datos cargados", tono: "neutro" };

  const horas = (ahora.getTime() - ultimaCarga.getTime()) / 3600_000;
  // Sólo alarmamos si la campaña debería estar produciendo datos ahora mismo.
  if (estado === "activa" && horas > HORAS_PARA_ALARMA) {
    return { etiqueta: `Sin actualizar hace ${antiguedad(horas)}`, tono: "ambar" };
  }
  return { etiqueta: `Actualizado hace ${antiguedad(horas)}`, tono: "gris" };
}
