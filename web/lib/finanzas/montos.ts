/**
 * El usuario escribe montos y cantidades a la argentina: el punto separa
 * miles y la coma separa decimales ("1.500,50"). Un parser que solo borra
 * todo lo que no sea dígito lee eso como 150050 — cien veces el monto real —
 * y ese bug pasó desapercibido porque los montos redondos ("34.000") dan la
 * misma respuesta con cualquiera de los dos enfoques.
 */

/** Deja solo dígitos, un único separador decimal (como ".") y nada más. */
function aFormatoEstandar(texto: string): string | null {
  const limpio = texto.trim().replace(/^\$\s*/, "");
  if (limpio === "") return null;

  // Un signo negativo es una entrada inválida, no "convertir a positivo".
  if (!/^[0-9.,]+$/.test(limpio)) return null;

  const comas = (limpio.match(/,/g) ?? []).length;
  const puntos = (limpio.match(/\./g) ?? []).length;

  // Más de un separador decimal ("1,5,3") no es un número: si hay coma,
  // solo puede haber una, y es la que marca los decimales.
  if (comas > 1) return null;

  let estandar: string;
  if (comas === 1) {
    // Con coma presente, el punto (si aparece) es separador de miles.
    estandar = limpio.replace(/\./g, "").replace(",", ".");
  } else if (puntos > 0) {
    // Sin coma, el punto es separador de miles ("34.000" → 34000). No hay
    // forma de distinguir esto de un decimal con punto, así que se asume la
    // convención argentina en toda la app, tal como pide el enunciado.
    estandar = limpio.replace(/\./g, "");
  } else {
    estandar = limpio;
  }

  return estandar;
}

/**
 * Parsea un monto en pesos tal como lo tipea un usuario argentino. Devuelve
 * null en vez de adivinar cuando la entrada no es un monto positivo válido:
 * un monto mal leído que entra a la base es peor que uno rechazado.
 */
export function parsearMonto(texto: string): number | null {
  if (typeof texto !== "string") return null;

  const estandar = aFormatoEstandar(texto);
  if (estandar === null) return null;

  const n = Number(estandar);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/**
 * Parsea una cantidad (unidades de un ítem). Tiene que ser un entero
 * positivo: una cantidad fraccionaria no tiene sentido en una columna
 * entera, así que se rechaza en vez de truncarla o redondearla en silencio.
 */
export function parsearCantidad(texto: string): number | null {
  if (typeof texto !== "string") return null;

  const limpio = texto.trim();
  if (!/^[0-9]+$/.test(limpio)) return null;

  const n = Number(limpio);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}
