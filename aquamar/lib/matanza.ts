/**
 * El partido de La Matanza, sus 16 localidades y los tres cordones.
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
    color: "#0C85A2",
    suave: "#d6eef3",
  },
  {
    id: "tercero",
    nombre: "Tercer cordón",
    descripcion: "Zona más extensa, en crecimiento urbano y semi-rural",
    color: "#3FC6E0",
    suave: "#e0f6fb",
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
};

export const LOCALIDADES: Localidad[] = [
  // Primer cordón: la franja pegada a CABA.
  { nombre: "Ramos Mejía", cordon: "primero", referencia: "Principal polo comercial y gastronómico del norte" },
  { nombre: "Lomas del Mirador", cordon: "primero" },
  { nombre: "Villa Madero", cordon: "primero", alias: ["Villa Eduardo Madero"] },
  { nombre: "La Tablada", cordon: "primero" },
  { nombre: "Ciudad Celina", cordon: "primero", alias: ["Villa Celina"] },
  { nombre: "Tapiales", cordon: "primero" },
  { nombre: "Villa Luzuriaga", cordon: "primero" },
  { nombre: "San Justo", cordon: "primero", referencia: "Cabecera y centro administrativo del partido" },
  { nombre: "Aldo Bonzi", cordon: "primero" },

  // Segundo cordón.
  { nombre: "Rafael Castillo", cordon: "segundo" },
  { nombre: "Isidro Casanova", cordon: "segundo" },
  { nombre: "Gregorio de Laferrere", cordon: "segundo", referencia: "La localidad más poblada del municipio", alias: ["Laferrere", "Gregorio Laferrere"] },
  { nombre: "Ciudad Evita", cordon: "segundo", referencia: "Diseño urbanístico planificado, declarado patrimonio" },

  // Tercer cordón: el más extenso.
  { nombre: "González Catán", cordon: "tercero", alias: ["Gonzalez Catan"] },
  { nombre: "Virrey del Pino", cordon: "tercero", referencia: "La de mayor superficie del partido" },
  { nombre: "20 de Junio", cordon: "tercero", referencia: "La menos poblada, de perfil más rural", alias: ["Veinte de Junio"] },
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

/*
 * Geometría del esquema. Cada cordón es una franja inclinada que va de arriba a
 * abajo; el primero a la derecha, pegado a CABA, y el tercero a la izquierda.
 * La inclinación es la que le da al conjunto forma de partido en vez de tres
 * columnas.
 */
const INCLINACION = 16;
export const ALTO = 180;

/*
 * Una sola columna por banda. Con dos entraban más localidades en menos alto,
 * pero "Gregorio de Laferrere" al lado de "Isidro Casanova" se pisaban: el
 * mapa se lee por los nombres, y un nombre tapado no lo lee nadie.
 */
const BANDAS: Record<CordonId, { desde: number; hasta: number }> = {
  primero: { desde: 68, hasta: 102 },
  segundo: { desde: 35, hasta: 68 },
  tercero: { desde: 2, hasta: 35 },
};

/** Los cuatro vértices de la franja de un cordón, para dibujarla. */
export function franjaDe(cordon: CordonId): string {
  const b = BANDAS[cordon];
  return [
    `M ${b.desde} 0`,
    `L ${b.hasta} 0`,
    `L ${b.hasta - INCLINACION} ${ALTO}`,
    `L ${b.desde - INCLINACION} ${ALTO}`,
    "Z",
  ].join(" ");
}

/** El centro de una banda a una altura dada: donde va su título. */
export function centroDeBanda(cordon: CordonId, y: number): number {
  const b = BANDAS[cordon];
  return (b.desde + b.hasta) / 2 - (INCLINACION * y) / ALTO;
}

export type Punto = { x: number; y: number };

/**
 * Dónde va una localidad dentro de su franja. Se reparten en filas de arriba
 * hacia abajo siguiendo el orden en que están declaradas, que es de norte a sur.
 */
export function posicionDe(nombre: string): Punto {
  const localidad = LOCALIDADES.find((l) => l.nombre === nombre)!;
  const hermanas = localidadesDe(localidad.cordon);
  const i = hermanas.indexOf(localidad);

  // El aire alcanza para el cúmulo de marcas más su nombre debajo.
  const arriba = 18;
  const abajo = ALTO - 18;
  const y = hermanas.length === 1 ? (arriba + abajo) / 2 : arriba + (i * (abajo - arriba)) / (hermanas.length - 1);

  return { x: centroDeBanda(localidad.cordon, y), y };
}

/**
 * Dónde cae la marca número `i` de una localidad, alrededor de su centro.
 *
 * Es una grilla fija, no una dispersión al azar: dos comercios de la misma
 * localidad no se pueden pisar, que era justamente lo que hacía ilegible el
 * mapa donde más clientes hay.
 */
const NIDO: Punto[] = [
  { x: 0, y: 0 },
  { x: -1, y: -0.85 },
  { x: 1, y: -0.85 },
  { x: -1, y: 0.85 },
  { x: 1, y: 0.85 },
  { x: -2, y: 0 },
  { x: 2, y: 0 },
  { x: 0, y: -1.7 },
  { x: 0, y: 1.7 },
  { x: -2, y: -1.7 },
  { x: 2, y: -1.7 },
  { x: -2, y: 1.7 },
];

export const MARCAS_POR_LOCALIDAD = NIDO.length;

export function nidoDe(i: number, paso: number): Punto {
  const casilla = NIDO[i % NIDO.length];
  return { x: casilla.x * paso, y: casilla.y * paso };
}
