import type { ContextoCompetencia, FichaNegocio, Hallazgo } from "@/lib/seo-local/tipos";

/** Total de puntos que reparte el bloque de competencia. */
export const PUNTOS_COMPETENCIA = 30;

const TOPE_BUSQUEDA = 5;

export type ResultadoCompetencia = {
  hallazgos: Hallazgo[];
  noEvaluados: string[];
  puestoPorResenas: number | null;
  totalEnRubro: number;
  resenasParaSubirUnPuesto: number | null;
};

/** Puesto (base 1) del valor propio dentro del conjunto, de mayor a menor. */
function puesto(propio: number, ajenos: number[]): number {
  return ajenos.filter((v) => v > propio).length + 1;
}

/** ¿Está en el tercio de abajo? Con 6 de 6, sí; con 2 de 6, no. */
function enTercioInferior(puestoActual: number, total: number): boolean {
  return puestoActual > (total * 2) / 3;
}

/**
 * Bloque 3 — competencia (30 puntos).
 * Compara contra los negocios del mismo rubro en la misma zona. Es el bloque
 * que convierte el diagnóstico en argumento de venta: no le decís "estás mal",
 * le decís "estás 6º de 9 y te faltan 14 reseñas para subir".
 */
export function auditarCompetencia(
  ficha: FichaNegocio,
  contexto: ContextoCompetencia,
): ResultadoCompetencia {
  const hallazgos: Hallazgo[] = [];
  const noEvaluados: string[] = [];
  const { competidores, posicionEnBusqueda } = contexto;

  const totalEnRubro = competidores.length + 1;
  let puestoPorResenas: number | null = null;
  let resenasParaSubirUnPuesto: number | null = null;

  if (competidores.length === 0) {
    // Sin nadie con quien comparar no se inventa un veredicto.
    noEvaluados.push("comp_puesto_resenas", "comp_puesto_puntaje");
  } else {
    puestoPorResenas = puesto(ficha.cantidadResenas, competidores.map((c) => c.cantidadResenas));

    // Reseñas que faltan para superar al inmediato superior.
    const porEncima = competidores
      .map((c) => c.cantidadResenas)
      .filter((v) => v > ficha.cantidadResenas)
      .sort((a, b) => a - b);
    if (porEncima.length > 0) {
      resenasParaSubirUnPuesto = porEncima[0] - ficha.cantidadResenas + 1;
    }

    if (enTercioInferior(puestoPorResenas, totalEnRubro)) {
      hallazgos.push({
        codigo: "comp_puesto_resenas",
        bloque: "competencia",
        gravedad: "alta",
        puntosPerdidos: 12,
        titulo: `Estás ${puestoPorResenas}º de ${totalEnRubro} en cantidad de reseñas`,
        accion:
          resenasParaSubirUnPuesto !== null
            ? `Con ${resenasParaSubirUnPuesto} reseñas más subís un puesto.`
            : "Sumar reseñas para escalar en el rubro.",
      });
    }

    // El puntaje puede faltar; en ese caso no se compara.
    if (ficha.puntaje === null) {
      noEvaluados.push("comp_puesto_puntaje");
    } else {
      const puntajesAjenos = competidores
        .map((c) => c.puntaje)
        .filter((p): p is number => p !== null);
      if (puntajesAjenos.length === 0) {
        noEvaluados.push("comp_puesto_puntaje");
      } else {
        const puestoPuntaje = puesto(ficha.puntaje, puntajesAjenos);
        if (enTercioInferior(puestoPuntaje, puntajesAjenos.length + 1)) {
          hallazgos.push({
            codigo: "comp_puesto_puntaje",
            bloque: "competencia",
            gravedad: "media",
            puntosPerdidos: 8,
            titulo: `Estás ${puestoPuntaje}º de ${puntajesAjenos.length + 1} en puntaje`,
            accion: "Mejorar la experiencia y pedir reseñas a los clientes conformes.",
          });
        }
      }
    }
  }

  if (posicionEnBusqueda === "no_evaluado") {
    noEvaluados.push("comp_fuera_de_busqueda");
  } else if (posicionEnBusqueda === "no_aparece" || posicionEnBusqueda > TOPE_BUSQUEDA) {
    hallazgos.push({
      codigo: "comp_fuera_de_busqueda",
      bloque: "competencia",
      gravedad: "alta",
      puntosPerdidos: 10,
      titulo:
        posicionEnBusqueda === "no_aparece"
          ? "No aparecés cuando buscan tu rubro en la zona"
          : `Aparecés ${posicionEnBusqueda}º cuando buscan tu rubro en la zona`,
      accion: `Entrar a los primeros ${TOPE_BUSQUEDA} resultados. Abajo de ahí casi nadie mira.`,
    });
  }

  return { hallazgos, noEvaluados, puestoPorResenas, totalEnRubro, resenasParaSubirUnPuesto };
}
