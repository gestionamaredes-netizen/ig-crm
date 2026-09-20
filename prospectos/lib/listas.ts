import { EQUIPO, PROSPECTOS } from "./datos";

export { EQUIPO, PROSPECTOS };

/** Rubros aceptados al cargar un negocio nuevo: los que ya existen en la base. */
export const RUBROS_LIBRES: string[] = Array.from(
  new Set(PROSPECTOS.map((p) => p.rubro)),
).sort();

export const LOCALIDADES_LIBRES: string[] = Array.from(
  new Set(PROSPECTOS.map((p) => p.localidad)),
).sort();
