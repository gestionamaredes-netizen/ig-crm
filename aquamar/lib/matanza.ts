/**
 * El partido de La Matanza, sus 16 localidades y los tres cordones.
 *
 * Los colores de los cordones no salen de la paleta de la marca a propósito.
 * Tres azules se distinguían por claridad, y sobre un mapa de calles —con sus
 * propios grises y verdes— eso no alcanzaba: azul, rojo y amarillo se separan
 * de un vistazo, que es lo que hace falta cuando el mapa se muestra en una
 * reunión y nadie va a mirar la referencia.
 *
 * El amarillo es el dorado del sol del sello, un poco más profundo: un amarillo
 * puro sobre el fondo claro del mapa deja los bordes finos de los círculos casi
 * invisibles.
 *
 * Los cordones no son una división oficial: son la forma en que se describe la
 * distancia a CABA, y es como Aqua Mar organiza el reparto. La lista y las
 * referencias salen del documento que pasó el cliente.
 *
 * El dibujo es un esquema, no un mapa a escala. El partido corre de noreste
 * —pegado a CABA— a sudoeste, y eso es lo que respeta: el orden de los cordones
 * y el de las localidades dentro de cada uno. Un mapa dibujado "a ojo" que
 * parezca catastral miente más que un esquema que se presenta como tal.
 *
 * Dentro de cada cordón las localidades van ordenadas de norte a sur, y la
 * posición en pantalla se calcula desde esa banda: así una localidad no puede
 * terminar dibujada en el cordón de al lado, que es lo que pasaba cuando cada
 * una traía sus coordenadas escritas a mano.
 */

export const CORDONES = [
  {
    id: "primero",
    nombre: "Primer cordón",
    descripcion: "Zona más urbana, comercial y cercana a CABA",
    color: "#053388",
    suave: "#dbe6f7",
  },
  {
    id: "segundo",
    nombre: "Segundo cordón",
    descripcion: "Zona intermedia de alta densidad poblacional",
    color: "#C62828",
    suave: "#fae2e2",
  },
  {
    id: "tercero",
    nombre: "Tercer cordón",
    descripcion: "Zona más extensa, en crecimiento urbano y semi-rural",
    color: "#DFA006",
    suave: "#fdf1cd",
  },
] as const;

export type CordonId = (typeof CORDONES)[number]["id"];

export type Localidad = {
  nombre: string;
  cordon: CordonId;
  /** Lo que la distingue, para el que mira el mapa sin conocer el partido. */
  referencia?: string;
  /** Otros nombres con los que aparece escrita en una dirección. */
  alias?: string[];
  /** Centro aproximado de la localidad, para ubicarla en el mapa. */
  lat: number;
  lon: number;
};

export const LOCALIDADES: Localidad[] = [
  // Primer cordón: la franja pegada a CABA.
  { nombre: "Ramos Mejía", cordon: "primero", lat: -34.6432, lon: -58.5654, referencia: "Principal polo comercial y gastronómico del norte" },
  { nombre: "Lomas del Mirador", cordon: "primero", lat: -34.6614, lon: -58.5261 },
  { nombre: "Villa Madero", cordon: "primero", lat: -34.6889, lon: -58.4972, alias: ["Villa Eduardo Madero"] },
  { nombre: "La Tablada", cordon: "primero", lat: -34.6836, lon: -58.5312 },
  { nombre: "Ciudad Celina", cordon: "primero", lat: -34.7139, lon: -58.483, alias: ["Villa Celina"] },
  { nombre: "Tapiales", cordon: "primero", lat: -34.7062, lon: -58.514 },
  { nombre: "Villa Luzuriaga", cordon: "primero", lat: -34.6667, lon: -58.5924 },
  { nombre: "San Justo", cordon: "primero", lat: -34.6767, lon: -58.5601, referencia: "Cabecera y centro administrativo del partido" },
  { nombre: "Aldo Bonzi", cordon: "primero", lat: -34.7161, lon: -58.533 },

  // Segundo cordón.
  { nombre: "Rafael Castillo", cordon: "segundo", lat: -34.6949, lon: -58.627 },
  { nombre: "Isidro Casanova", cordon: "segundo", lat: -34.7003, lon: -58.5872 },
  { nombre: "Gregorio de Laferrere", cordon: "segundo", lat: -34.7431, lon: -58.59, referencia: "La localidad más poblada del municipio", alias: ["Laferrere", "Gregorio Laferrere"] },
  { nombre: "Ciudad Evita", cordon: "segundo", lat: -34.7167, lon: -58.5472, referencia: "Diseño urbanístico planificado, declarado patrimonio" },

  // Tercer cordón: el más extenso.
  { nombre: "González Catán", cordon: "tercero", lat: -34.7722, lon: -58.6417, alias: ["Gonzalez Catan"] },
  { nombre: "Virrey del Pino", cordon: "tercero", lat: -34.8667, lon: -58.6833, referencia: "La de mayor superficie del partido" },
  { nombre: "20 de Junio", cordon: "tercero", lat: -34.8933, lon: -58.7431, referencia: "La menos poblada, de perfil más rural", alias: ["Veinte de Junio"] },
];

export function cordonDe(id: CordonId) {
  return CORDONES.find((c) => c.id === id)!;
}

export function localidadesDe(cordon: CordonId): Localidad[] {
  return LOCALIDADES.filter((l) => l.cordon === cordon);
}

/** Para comparar "Gonzalez Catan" con "González Catán" sin que importe nada más. */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Busca una localidad del partido dentro de un texto libre —una dirección
 * escrita a mano, por ejemplo—.
 *
 * Empieza por los nombres más largos: "Villa Madero" tiene que ganarle a
 * "Madero" suelto, y "Ciudad Evita" no puede confundirse con "Ciudad Celina".
 * Devuelve null cuando no hay una coincidencia clara: adivinar mal la localidad
 * de un comercio ensucia el mapa que se le va a mostrar a la fábrica.
 */
export function localidadEnTexto(texto: string): string | null {
  const donde = normalizar(texto);
  if (!donde) return null;

  const candidatos = LOCALIDADES.flatMap((l) => [l.nombre, ...(l.alias ?? [])].map((n) => ({ nombre: l.nombre, busca: normalizar(n) })))
    .sort((a, b) => b.busca.length - a.busca.length);

  for (const c of candidatos) {
    if (donde.includes(c.busca)) return c.nombre;
  }
  return null;
}

export function esLocalidadDelPartido(nombre: string): boolean {
  return LOCALIDADES.some((l) => l.nombre === nombre);
}

/** Encuadre del partido completo, para abrir el mapa mostrando todo. */
export const ENCUADRE = {
  centro: [-34.7667, -58.6167] as [number, number],
  zoom: 11,
  /** Esquina sudoeste y noreste, para que el mapa no se vaya del partido. */
  limites: [
    [-34.95, -58.82],
    [-34.6, -58.45],
  ] as [[number, number], [number, number]],
};

/**
 * Separa los comercios que comparten el centro de su localidad.
 *
 * Sin esto, tres comercios sin dirección exacta quedan apilados en el mismo
 * punto: se ve un pin solo y los otros dos no se pueden ni tocar. El desvío es
 * de unos cientos de metros —bien adentro de cualquier localidad del partido—,
 * y el pin va punteado justamente para decir que esa posición es aproximada.
 *
 * Es una espiral y no algo al azar: la posición de un comercio no puede cambiar
 * cada vez que se carga la página ni cuando entra otro al lado.
 */
export function dispersarEnLocalidad(indice: number): { lat: number; lon: number } {
  if (indice === 0) return { lat: 0, lon: 0 };

  // Anillos de 6, 12, 18… a 500 m, 1 km, 1,5 km del centro.
  let anillo = 1;
  let restan = indice;
  while (restan > anillo * 6) {
    restan -= anillo * 6;
    anillo += 1;
  }
  const cuantos = anillo * 6;
  const angulo = ((restan - 1) / cuantos) * 2 * Math.PI;
  const radio = anillo * 0.0045;

  // Un grado de longitud mide menos que uno de latitud a esta altura del mundo.
  return { lat: radio * Math.sin(angulo), lon: (radio * Math.cos(angulo)) / Math.cos((34.75 * Math.PI) / 180) };
}
