import { auditarFicha, PUNTOS_FICHA } from "@/lib/seo-local/reglas-ficha";
import { auditarReputacion, PUNTOS_REPUTACION } from "@/lib/seo-local/reglas-reputacion";
import { auditarCompetencia, PUNTOS_COMPETENCIA } from "@/lib/seo-local/reglas-competencia";
import type {
  Auditoria,
  ContextoCompetencia,
  FichaNegocio,
  Hallazgo,
  RevisionManual,
} from "@/lib/seo-local/tipos";

const PENALIZACION_NO_RECLAMADA = 10;
const PENALIZACION_NO_RESPONDE = 5;

const restar = (total: number, hallazgos: Hallazgo[]): number =>
  Math.max(0, total - hallazgos.reduce((s, h) => s + h.puntosPerdidos, 0));

/**
 * Motor de auditoría. Función pura: no toca red ni base de datos.
 *
 * Las penalizaciones manuales se restan del total de los tres bloques, con piso
 * en 0. Si algo no se verificó todavía, no se penaliza: se declara en
 * `noEvaluados` y el informe lo dice. Nunca se asume el peor ni el mejor caso.
 */
export function auditar(
  ficha: FichaNegocio,
  contexto: ContextoCompetencia,
  manual: RevisionManual,
  ahora: Date,
): Auditoria {
  const deFicha = auditarFicha(ficha);
  const deReputacion = auditarReputacion(ficha, ahora);
  const deCompetencia = auditarCompetencia(ficha, contexto);

  const hallazgos: Hallazgo[] = [
    ...deFicha,
    ...deReputacion.hallazgos,
    ...deCompetencia.hallazgos,
  ];
  const noEvaluados = [...deReputacion.noEvaluados, ...deCompetencia.noEvaluados];

  let penalizacionManual = 0;

  if (manual.fichaReclamada === null) {
    noEvaluados.push("manual_ficha_reclamada");
  } else if (!manual.fichaReclamada) {
    penalizacionManual += PENALIZACION_NO_RECLAMADA;
    hallazgos.push({
      codigo: "manual_ficha_reclamada",
      bloque: "manual",
      gravedad: "alta",
      puntosPerdidos: PENALIZACION_NO_RECLAMADA,
      titulo: "La ficha no está reclamada por el dueño",
      accion: "Reclamar la ficha en Google. Sin eso no controlás lo que Google muestra de tu negocio.",
    });
  }

  if (manual.respondeResenas === null) {
    noEvaluados.push("manual_responde_resenas");
  } else if (!manual.respondeResenas) {
    penalizacionManual += PENALIZACION_NO_RESPONDE;
    hallazgos.push({
      codigo: "manual_responde_resenas",
      bloque: "manual",
      gravedad: "media",
      puntosPerdidos: PENALIZACION_NO_RESPONDE,
      titulo: "No respondés las reseñas",
      accion: "Responder todas, sobre todo las malas. Google lo premia y los clientes lo leen.",
    });
  }

  const puntajeFicha = restar(PUNTOS_FICHA, deFicha);
  const puntajeReputacion = restar(PUNTOS_REPUTACION, deReputacion.hallazgos);
  const puntajeCompetencia = restar(PUNTOS_COMPETENCIA, deCompetencia.hallazgos);

  const puntajeTotal = Math.max(
    0,
    puntajeFicha + puntajeReputacion + puntajeCompetencia - penalizacionManual,
  );

  return {
    puntajeTotal,
    puntajeFicha,
    puntajeReputacion,
    puntajeCompetencia,
    penalizacionManual,
    hallazgos,
    noEvaluados,
    puestoPorResenas: deCompetencia.puestoPorResenas,
    totalEnRubro: deCompetencia.totalEnRubro,
    resenasParaSubirUnPuesto: deCompetencia.resenasParaSubirUnPuesto,
  };
}

/** La frase que se le dice al prospecto en la reunión. El puntaje es secundario. */
export function resumenDeVenta(auditoria: Auditoria): string {
  const { puestoPorResenas, totalEnRubro, resenasParaSubirUnPuesto } = auditoria;

  // Sin competidores no hay comparación posible. Decir "sos el mejor" acá sería
  // afirmarle al comerciante algo que no medimos.
  if (puestoPorResenas === null) {
    return "Todavía no hay competidores cargados de tu rubro en la zona para comparar.";
  }
  if (resenasParaSubirUnPuesto === null) {
    return "Sos el mejor posicionado de tu rubro en la zona.";
  }
  return `Estás ${puestoPorResenas}º de ${totalEnRubro} en tu rubro. Con ${resenasParaSubirUnPuesto} reseñas más pasás al puesto de arriba.`;
}
