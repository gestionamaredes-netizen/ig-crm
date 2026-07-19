import type { FichaNegocio, Hallazgo } from "@/lib/seo-local/tipos";

/** Total de puntos que reparte el bloque de reputación. */
export const PUNTOS_REPUTACION = 30;

const PUNTAJE_MINIMO = 4.0;
const RESENAS_MINIMAS = 10;
const MESES_PARA_VIEJA = 6;
const DIAS_PARA_VIEJA = MESES_PARA_VIEJA * 30;

/**
 * Bloque 2 — reputación (30 puntos).
 *
 * Caso especial: un negocio sin ninguna reseña pierde el bloque entero de una,
 * con un solo hallazgo. No tiene sentido decirle "tenés pocas reseñas" y además
 * "tu puntaje es bajo" cuando el problema es uno solo y evidente.
 *
 * `ahora` entra por parámetro para que la regla de antigüedad sea determinista.
 */
export function auditarReputacion(
  ficha: FichaNegocio,
  ahora: Date,
): { hallazgos: Hallazgo[]; noEvaluados: string[] } {
  const hallazgos: Hallazgo[] = [];
  const noEvaluados: string[] = [];

  if (ficha.cantidadResenas === 0) {
    hallazgos.push({
      codigo: "rep_sin_resenas",
      bloque: "reputacion",
      gravedad: "alta",
      puntosPerdidos: PUNTOS_REPUTACION,
      titulo: "No tenés ninguna reseña",
      accion: "Pedirle reseña a los clientes habituales. Es lo que más mueve el posicionamiento local.",
    });
    return { hallazgos, noEvaluados };
  }

  if (ficha.puntaje === null) {
    noEvaluados.push("rep_puntaje_bajo");
  } else if (ficha.puntaje < PUNTAJE_MINIMO) {
    hallazgos.push({
      codigo: "rep_puntaje_bajo",
      bloque: "reputacion",
      gravedad: "alta",
      puntosPerdidos: 12,
      titulo: `Tu puntaje es ${ficha.puntaje.toFixed(1)} de 5`,
      accion: `Trabajar las reseñas para superar ${PUNTAJE_MINIMO.toFixed(1)}. Debajo de eso, la gente elige al de al lado.`,
    });
  }

  if (ficha.cantidadResenas < RESENAS_MINIMAS) {
    hallazgos.push({
      codigo: "rep_pocas_resenas",
      bloque: "reputacion",
      gravedad: "alta",
      puntosPerdidos: 12,
      titulo: `Tenés ${ficha.cantidadResenas} reseña${ficha.cantidadResenas === 1 ? "" : "s"}`,
      accion: `Llegar a ${RESENAS_MINIMAS} como piso. Es el mínimo para que Google te tome en serio.`,
    });
  }

  if (ficha.fechaResenaMasReciente === null) {
    noEvaluados.push("rep_resenas_viejas");
  } else {
    const dias = (ahora.getTime() - new Date(ficha.fechaResenaMasReciente).getTime()) / 86_400_000;
    if (dias > DIAS_PARA_VIEJA) {
      hallazgos.push({
        codigo: "rep_resenas_viejas",
        bloque: "reputacion",
        gravedad: "media",
        puntosPerdidos: 6,
        titulo: `Tu última reseña es de hace ${Math.floor(dias / 30)} meses`,
        accion: "Conseguir reseñas nuevas seguido. Google lee el silencio como negocio apagado.",
      });
    }
  }

  return { hallazgos, noEvaluados };
}
