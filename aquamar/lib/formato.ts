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
