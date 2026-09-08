/**
 * El usuario escribe montos y cantidades a la argentina: el punto separa
 * miles y la coma separa decimales ("1.500,50"). Un parser que solo borra
 * todo lo que no sea dígito lee eso como 150050 — cien veces el monto real —
 * y ese bug pasó desapercibido porque los montos redondos ("34.000") dan la
 * misma respuesta con cualquiera de los dos enfoques.
 */

// Un grupo de miles a la argentina: 1 a 3 dígitos, seguidos de uno o más
// grupos de exactamente 3 dígitos, cada uno precedido por un punto.
// "34.000" y "1.234.567" matchean; "1.50", "100.5", ".50", "1." y "1.5000"
// no, porque ninguno forma grupos de miles válidos.
const GRUPO_DE_MILES = /^\d{1,3}(\.\d{3})+$/;

// Un monto por encima de esto ya no es un número de pesos plausible, y cerca
// del límite de precisión de un float64 un redondeo silencioso podría alterar
// el valor guardado. Se rechaza en vez de arriesgar esa pérdida.
const TECHO_MONTO = 1e12;
const TECHO_CANTIDAD = 1_000_000;

/**
 * Deja solo dígitos y un único separador decimal ("."), validando que la
 * entrada respete estrictamente la convención argentina en vez de adivinar.
 * Devuelve null ante cualquier ambigüedad.
 */
function aFormatoEstandar(texto: string): string | null {
  const limpio = texto.trim().replace(/^\$\s*/, "");
  if (limpio === "") return null;

  // Un signo negativo es una entrada inválida, no "convertir a positivo".
  if (!/^[0-9.,]+$/.test(limpio)) return null;

  const comas = (limpio.match(/,/g) ?? []).length;

  // Más de un separador decimal ("1,5,3") no es un número: si hay coma,
  // solo puede haber una, y es la que marca los decimales.
  if (comas > 1) return null;

  let parteEntera: string;
  let parteDecimal = "";

  if (comas === 1) {
    const [entera, decimal] = limpio.split(",");
    // La parte decimal en pesos es de 1 o 2 dígitos. Tres dígitos ("1500,555")
    // o una parte vacía ("1500,") no son un monto en pesos.
    if (!/^\d{1,2}$/.test(decimal)) return null;
    parteEntera = entera;
    parteDecimal = decimal;
  } else {
    // Sin coma: si hay UN solo punto seguido de 1 o 2 dígitos, se acepta como
    // decimal al estilo internacional ("4925.00", "12.5"). No es ambiguo: un
    // grupo de miles a la argentina siempre tiene EXACTAMENTE 3 dígitos, así
    // que "1.520" (3 dígitos) sigue leyéndose como 1520 y no como 1,52. Esto
    // es solo comodidad (mucha gente tipea el punto decimal); no cambia cómo
    // se lee ningún monto que ya se aceptaba.
    const decimalConPunto = limpio.match(/^(\d+)\.(\d{1,2})$/);
    if (decimalConPunto) {
      parteEntera = decimalConPunto[1];
      parteDecimal = decimalConPunto[2];
    } else {
      parteEntera = limpio;
    }
  }

  let parteEnteraNormalizada: string;
  if (parteEntera.includes(".")) {
    // Con punto presente, la parte entera tiene que formar grupos de miles
    // válidos exactamente — "1.50", "100.5", ".50" y "1." se rechazan en vez
    // de interpretarse como si el punto fuera decimal.
    if (!GRUPO_DE_MILES.test(parteEntera)) return null;
    parteEnteraNormalizada = parteEntera.replace(/\./g, "");
  } else {
    // Sin punto, cualquier secuencia de dígitos es válida ("34000", "1500").
    if (!/^\d+$/.test(parteEntera)) return null;
    parteEnteraNormalizada = parteEntera;
  }

  return parteDecimal ? `${parteEnteraNormalizada}.${parteDecimal}` : parteEnteraNormalizada;
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
  if (!Number.isFinite(n) || n <= 0 || n >= TECHO_MONTO) return null;
  return n;
}

/**
 * Valida el total que efectivamente se guarda (`unitario × cantidad`,
 * calculado en actions.ts) contra el mismo techo que protege un monto
 * individual. `parsearMonto` y `parsearCantidad` validan cada factor por
 * separado, pero un unitario y una cantidad cada uno por debajo de su propio
 * límite pueden multiplicarse más allá de `TECHO_MONTO` — y ese producto
 * nunca pasa por ninguno de los dos parsers. Devuelve null en vez de guardar
 * un total que ya no es preciso ni plausible.
 */
export function validarTotal(total: number): number | null {
  if (!Number.isFinite(total) || total <= 0 || total >= TECHO_MONTO) return null;
  return total;
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
  if (!Number.isInteger(n) || n <= 0 || n > TECHO_CANTIDAD) return null;
  return n;
}
