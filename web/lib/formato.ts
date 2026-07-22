export function formatearPesos(n: number): string {
  return `$${Math.round(n).toLocaleString("es-AR")}`;
}
