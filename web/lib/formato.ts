export function formatearPesos(n: number): string {
  const redondeado = Math.round(n);
  const signo = redondeado < 0 ? "-" : "";
  return `${signo}$${Math.abs(redondeado).toLocaleString("es-AR")}`;
}
