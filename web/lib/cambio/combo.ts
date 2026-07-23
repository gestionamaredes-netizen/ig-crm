export type OpcionCombo = { value: string; nombre: string };

/** Filtra por coincidencia parcial en el nombre, ignorando mayúsculas y espacios. */
export function filtrarOpciones(opciones: OpcionCombo[], texto: string): OpcionCombo[] {
  const q = texto.trim().toLowerCase();
  if (q === "") return opciones;
  return opciones.filter((o) => o.nombre.toLowerCase().includes(q));
}

/** ¿Algún nombre es exactamente el texto (ignorando mayúsculas y espacios)? */
export function hayCoincidenciaExacta(opciones: OpcionCombo[], texto: string): boolean {
  const q = texto.trim().toLowerCase();
  if (q === "") return false;
  return opciones.some((o) => o.nombre.trim().toLowerCase() === q);
}

/**
 * Qué valor viaja al formulario. Con una opción elegida, su `value`. Sin
 * selección: si el campo admite texto libre (emisor/receptor), el texto
 * recortado; si no (cliente, que es una FK), cadena vacía.
 */
export function valorASubmit(sel: OpcionCombo | null, texto: string, permitirLibre: boolean): string {
  if (sel) return sel.value;
  return permitirLibre ? texto.trim() : "";
}
