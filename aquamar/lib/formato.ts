const ZONA = "America/Argentina/Buenos_Aires";

const pesos = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatearPesos(centavos: number): string {
  return pesos.format(centavos / 100);
}

/** Para inputs: "12345" centavos -> "123,45" */
export function centavosAInput(centavos: number): string {
  return (centavos / 100).toFixed(2).replace(".", ",");
}

/**
 * Lee un importe escrito a mano en formato argentino: "1.234,50", "1234,5",
 * "$ 1.234". Devuelve centavos, o null si no es un número válido.
 *
 * Un punto con exactamente tres dígitos detrás es separador de miles ("1.234"
 * son mil doscientos treinta y cuatro pesos, no uno con veintitrés). Si el
 * texto trae coma y punto, la coma manda como decimal.
 */
export function parsearMonto(texto: string): number | null {
  const limpio = texto.trim().replace(/^\$/, "").replace(/\s/g, "");
  if (limpio === "") return null;
  if (!/^-?[\d.,]+$/.test(limpio)) return null;

  const negativo = limpio.startsWith("-");
  let cuerpo = negativo ? limpio.slice(1) : limpio;

  const tieneComa = cuerpo.includes(",");
  if (tieneComa) {
    // La coma es el decimal: los puntos que queden son miles.
    if ((cuerpo.match(/,/g) ?? []).length > 1) return null;
    cuerpo = cuerpo.replace(/\./g, "").replace(",", ".");
  } else {
    const puntos = cuerpo.match(/\./g) ?? [];
    if (puntos.length > 1) {
      cuerpo = cuerpo.replace(/\./g, "");
    } else if (puntos.length === 1) {
      const decimales = cuerpo.split(".")[1];
      // Tres dígitos detrás del punto = separador de miles al estilo argentino.
      if (decimales.length === 3) cuerpo = cuerpo.replace(".", "");
      else if (decimales.length > 2) return null;
    }
  }

  const valor = Number(cuerpo);
  if (!Number.isFinite(valor)) return null;

  const centavos = Math.round(valor * 100);
  return negativo ? -centavos : centavos;
}

export function parsearEntero(texto: string): number | null {
  const limpio = texto.trim().replace(/\./g, "");
  if (limpio === "" || !/^-?\d+$/.test(limpio)) return null;
  return Number(limpio);
}

/** Fecha de hoy en Buenos Aires, formato YYYY-MM-DD. */
export function hoy(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: ZONA });
}

/** Primer día del mes actual, YYYY-MM-DD. */
export function inicioDeMes(fecha = hoy()): string {
  return `${fecha.slice(0, 7)}-01`;
}

/** "2026-09-01" -> "01/09/2026" */
export function formatearFecha(iso: string): string {
  const [a, m, d] = iso.slice(0, 10).split("-");
  return d && m && a ? `${d}/${m}/${a}` : iso;
}

export function ahora(): string {
  return new Date().toISOString();
}

export function nuevoId(): string {
  return crypto.randomUUID();
}

/** Token de acceso para links de cliente/representante: corto pero no adivinable. */
export function nuevoToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * El depósito cuenta en bultos, el sistema en unidades. Esto traduce de uno al
 * otro sin cambiar lo que se guarda: el stock sigue siendo un número de
 * unidades, y de ahí cuelgan el precio, el costo y el historial de pedidos.
 */
export function enBultos(unidades: number, porBulto: number): { bultos: number; sueltas: number } {
  if (porBulto <= 1) return { bultos: unidades, sueltas: 0 };
  return { bultos: Math.floor(unidades / porBulto), sueltas: unidades % porBulto };
}

/** "12 bultos + 5" o "12 bultos", para mostrar al lado de las unidades. */
export function textoBultos(unidades: number, porBulto: number): string {
  if (porBulto <= 1 || unidades === 0) return `${unidades}`;
  const { bultos, sueltas } = enBultos(unidades, porBulto);
  if (bultos === 0) return `${sueltas} sueltas`;
  return sueltas === 0 ? `${bultos} bultos` : `${bultos} bultos + ${sueltas}`;
}

/** Pasa a unidades lo que se escribió en bultos. */
export function desdeBultos(bultos: number, porBulto: number): number {
  return bultos * Math.max(1, porBulto);
}

/**
 * Reparte 100 entre las partes de modo que los porcentajes redondeados sumen
 * exactamente 100. Redondear cada uno por su cuenta da cosas como 63% y 38%
 * juntos, que en una pantalla de plata se lee como un error de cuentas.
 *
 * El sobrante va a las partes con mayor resto, que es el reparto que menos
 * desvía a cada una de su valor real.
 */
export function porcentajesQueSuman(valores: number[]): number[] {
  const total = valores.reduce((a, v) => a + v, 0);
  if (total <= 0) return valores.map(() => 0);

  const exactos = valores.map((v) => (v / total) * 100);
  const enteros = exactos.map(Math.floor);
  let sobrante = 100 - enteros.reduce((a, v) => a + v, 0);

  const porResto = exactos
    .map((v, i) => ({ i, resto: v - Math.floor(v) }))
    .sort((a, b) => b.resto - a.resto);

  for (const { i } of porResto) {
    if (sobrante <= 0) break;
    enteros[i]++;
    sobrante--;
  }
  return enteros;
}
