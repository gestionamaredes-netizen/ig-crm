import type { Coordenada } from "@/lib/seo-local/geo";

/** Ficha de Google de un negocio, ya normalizada (no es el formato crudo de Places). */
export type FichaNegocio = {
  idExterno: string;
  nombre: string;
  rubro: string | null;
  direccion: string;
  ubicacion: Coordenada;
  telefono: string | null;
  sitioWeb: string | null;
  /** Cantidad de días de la semana con horario cargado, 0 a 7. */
  diasConHorario: number;
  /** Promedio de 1 a 5. null = todavía no tiene reseñas. */
  puntaje: number | null;
  cantidadResenas: number;
  /** Fecha ISO de la reseña más reciente. null = no hay reseñas. */
  fechaResenaMasReciente: string | null;
  cantidadFotos: number;
  estadoOperativo: "abierto" | "cerrado_temporal" | "cerrado_definitivo" | "desconocido";
};

/** Las dos cosas que Places no informa y hay que mirar a ojo. null = sin verificar. */
export type RevisionManual = {
  fichaReclamada: boolean | null;
  respondeResenas: boolean | null;
};

export type Gravedad = "alta" | "media" | "baja";

export type BloqueAuditoria = "ficha" | "reputacion" | "competencia" | "manual";

export type Hallazgo = {
  codigo: string;
  bloque: BloqueAuditoria;
  gravedad: Gravedad;
  puntosPerdidos: number;
  titulo: string;
  accion: string;
};

/**
 * Posición del negocio cuando alguien busca "rubro + localidad".
 * Número = puesto (base 1). "no_aparece" = se buscó y no está. "no_evaluado" = no se buscó.
 */
export type PosicionBusqueda = number | "no_aparece" | "no_evaluado";

export type ContextoCompetencia = {
  /** Fichas del mismo rubro en la misma zona, sin incluir al negocio auditado. */
  competidores: FichaNegocio[];
  posicionEnBusqueda: PosicionBusqueda;
};

export type Auditoria = {
  puntajeTotal: number;
  puntajeFicha: number;
  puntajeReputacion: number;
  puntajeCompetencia: number;
  penalizacionManual: number;
  hallazgos: Hallazgo[];
  /** Códigos de reglas que no se pudieron evaluar por falta de datos. */
  noEvaluados: string[];
  /** Puesto por cantidad de reseñas entre los del rubro (base 1). null = sin competidores. */
  puestoPorResenas: number | null;
  totalEnRubro: number;
  /** Cuántas reseñas faltan para pasar al de arriba. null = ya es primero o no hay datos. */
  resenasParaSubirUnPuesto: number | null;
};
