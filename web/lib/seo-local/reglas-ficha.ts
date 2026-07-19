import type { FichaNegocio, Hallazgo } from "@/lib/seo-local/tipos";

/** Total de puntos que reparte el bloque de la ficha. */
export const PUNTOS_FICHA = 40;

const MINIMO_FOTOS = 5;

const vacio = (v: string | null): boolean => v === null || v.trim() === "";

/**
 * Bloque 1 — la ficha de Google (40 puntos).
 * Todo lo que evalúa se corrige en una tarde de trabajo, así que es lo primero
 * que se le muestra al prospecto: son las victorias rápidas.
 */
export function auditarFicha(ficha: FichaNegocio): Hallazgo[] {
  const hallazgos: Hallazgo[] = [];

  if (vacio(ficha.telefono)) {
    hallazgos.push({
      codigo: "ficha_sin_telefono",
      bloque: "ficha",
      gravedad: "alta",
      puntosPerdidos: 8,
      titulo: "No tenés teléfono cargado en Google",
      accion: "Cargar el teléfono para que aparezca el botón de llamar en el celular.",
    });
  }

  if (vacio(ficha.sitioWeb)) {
    hallazgos.push({
      codigo: "ficha_sin_web",
      bloque: "ficha",
      gravedad: "media",
      puntosPerdidos: 8,
      titulo: "No tenés sitio web enlazado",
      accion: "Enlazar un sitio o una landing. Sin web, Google tiene menos con qué posicionarte.",
    });
  }

  if (ficha.diasConHorario < 7) {
    hallazgos.push({
      codigo: "ficha_horarios_incompletos",
      bloque: "ficha",
      gravedad: "alta",
      puntosPerdidos: 8,
      titulo: `Tenés horarios cargados en ${ficha.diasConHorario} de 7 días`,
      accion: "Completar los 7 días. Sin horario, Google no te muestra como \"abierto ahora\".",
    });
  }

  if (vacio(ficha.rubro)) {
    hallazgos.push({
      codigo: "ficha_sin_rubro",
      bloque: "ficha",
      gravedad: "alta",
      puntosPerdidos: 6,
      titulo: "No tenés categoría principal definida",
      accion: "Elegir la categoría principal. Es lo que decide en qué búsquedas aparecés.",
    });
  }

  if (ficha.cantidadFotos < MINIMO_FOTOS) {
    hallazgos.push({
      codigo: "ficha_pocas_fotos",
      bloque: "ficha",
      gravedad: "media",
      puntosPerdidos: 6,
      titulo: `Tenés ${ficha.cantidadFotos} foto${ficha.cantidadFotos === 1 ? "" : "s"}`,
      accion: `Subir al menos ${MINIMO_FOTOS} fotos: frente del local, interior y productos.`,
    });
  }

  if (ficha.estadoOperativo === "cerrado_temporal" || ficha.estadoOperativo === "cerrado_definitivo") {
    hallazgos.push({
      codigo: "ficha_cerrado",
      bloque: "ficha",
      gravedad: "alta",
      puntosPerdidos: 4,
      titulo: "Google te muestra como cerrado",
      accion: "Corregir el estado del negocio en la ficha. Estás perdiendo clientes que te creen cerrado.",
    });
  }

  return hallazgos;
}
