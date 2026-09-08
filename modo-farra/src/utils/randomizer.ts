import { Phrase, getPhrasesByLoop } from '../data/phrases';

/**
 * MOTOR DE RANDOMIZER - Modo Farra
 * Genera variaciones controladas de loops para 110s de contenido único
 * por cada vuelta, manteniendo coherencia temática y calidad visual.
 */

// Seed-based PRNG para reproducibilidad (opcional)
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Selecciona aleatoriamente un elemento de un array
 * @param array Array de items
 * @param seed Opcional: seed para reproducibilidad
 */
export function randomChoice<T>(array: T[], seed?: number): T {
  const rand = seed !== undefined ? seededRandom(seed) : Math.random();
  return array[Math.floor(rand * array.length)];
}

/**
 * Selecciona múltiples items únicos de un array (sin repetición)
 * @param array Array original
 * @param count Cantidad a seleccionar
 */
export function randomChoiceMultiple<T>(
  array: T[],
  count: number
): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Selecciona un item ponderado por weight
 * @param items Array de items con propiedad weight
 * @param seed Opcional: seed para reproducibilidad
 */
export function weightedRandomChoice<T extends { weight: number }>(
  items: T[],
  seed?: number
): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let rand = seed !== undefined ? seededRandom(seed) : Math.random();
  rand *= totalWeight;

  let accumulated = 0;
  for (const item of items) {
    accumulated += item.weight;
    if (rand <= accumulated) {
      return item;
    }
  }
  return items[items.length - 1];
}

/**
 * Categorías de variación para cada bloque de material
 * Determina qué tipo de contenido aparece en qué frame
 */
export type MaterialBlockType =
  | 'commercial'   // Publicidades
  | 'clip'         // Videoclips de cumbia/bailanta
  | 'chat'         // Ventana MSN/chat
  | 'nosignal'     // Nieve TV / sin señal
  | 'news'         // Noticieros/noticias
  | 'mirror'       // Espejo baño
  | 'music'        // Reproductor de música (Discman)
  | 'zapping';     // Cambio de canales TV

/**
 * Orden de bloques de material por defecto (Loop01)
 * Puede variarse usando randomizer
 */
export const DEFAULT_MATERIAL_ORDER: MaterialBlockType[] = [
  'commercial',
  'clip',
  'chat',
  'nosignal',
  'news',
  'mirror',
  'music',
  'zapping',
];

/**
 * Posibles variaciones para cada bloque
 * Define qué tipos de contenido pueden reemplazarse
 */
export const MATERIAL_VARIATIONS: Record<MaterialBlockType, MaterialBlockType[]> = {
  commercial: ['commercial', 'clip', 'news'],
  clip: ['clip', 'music', 'zapping'],
  chat: ['chat', 'news', 'nosignal'],
  nosignal: ['nosignal', 'mirror'],
  news: ['news', 'commercial', 'clip'],
  mirror: ['mirror', 'nosignal'],
  music: ['music', 'zapping', 'commercial'],
  zapping: ['zapping', 'clip', 'news'],
};

/**
 * Configuración de variabilidad por loop
 * Loop 1: Más estable (identidad fija)
 * Loop 4: Más caótico (muchas variaciones)
 */
export const LOOP_VARIABILITY: Record<number, number> = {
  1: 0.2,   // 20% de cambios
  2: 0.4,   // 40% de cambios
  3: 0.6,   // 60% de cambios
  4: 0.8,   // 80% de cambios (caótico)
};

/**
 * Genera un orden de bloques material variado pero coherente
 * @param loopNumber Loop actual (1-4)
 * @param seed Seed para reproducibilidad
 * @returns Nuevo orden de bloques
 */
export function generateMaterialOrder(
  loopNumber: number,
  seed?: number
): MaterialBlockType[] {
  const variability = LOOP_VARIABILITY[loopNumber] ?? 0.5;
  const order = [...DEFAULT_MATERIAL_ORDER];

  // Decide cuántos bloques intercambiar
  const swapCount = Math.floor(order.length * variability);

  for (let i = 0; i < swapCount; i++) {
    const idx1 = Math.floor(Math.random() * order.length);
    const currentBlock = order[idx1];
    const variations = MATERIAL_VARIATIONS[currentBlock] || [currentBlock];
    order[idx1] = randomChoice(variations, seed ? seed + i : undefined);
  }

  return order;
}

/**
 * Selecciona frase de burst de alta puntuación
 * @param loopNumber Loop actual
 * @param seed Seed para reproducibilidad
 */
export function selectBurstPhrase(
  loopNumber: number,
  seed?: number
): Phrase {
  const phrasesByLoop = getPhrasesByLoop(loopNumber);
  const highWeight = phrasesByLoop.filter((p) => p.weight >= 8);

  if (highWeight.length === 0) {
    return phrasesByLoop[0];
  }

  return randomChoice(highWeight, seed);
}

/**
 * Genera variaciones de pico emocional para "ESTA TE LA SABÉS"
 * (fontsize, color, efecto CRT)
 */
export interface PeakVariation {
  fontSize: number;      // 140-180
  intensity: 'subtle' | 'heavy';  // CRT intensity
  flashCount: number;    // 0-3 flashes adicionales
}

export function generatePeakVariation(seed?: number): PeakVariation {
  const baseSeed = seed ?? Math.random() * 1000;
  return {
    fontSize: 140 + Math.floor(seededRandom(baseSeed) * 40),
    intensity: seededRandom(baseSeed + 1) > 0.5 ? 'heavy' : 'subtle',
    flashCount: Math.floor(seededRandom(baseSeed + 2) * 3),
  };
}

/**
 * Genera configuración de logo (posición, tamaño, color)
 * El logo debe parecer "falla de señal" o "glitch"
 */
export interface LogoVariation {
  size: number;          // 150-250px
  rotation: number;      // -5 a 5 grados
  positionX: 'left' | 'center' | 'right';
  positionY: 'top' | 'center' | 'bottom';
  opacity: number;       // 0.7-1.0
}

export function generateLogoVariation(seed?: number): LogoVariation {
  const baseSeed = seed ?? Math.random() * 1000;
  const positions: Array<'left' | 'center' | 'right'> = ['left', 'center', 'right'];
  const verticals: Array<'top' | 'center' | 'bottom'> = ['top', 'center', 'bottom'];

  return {
    size: 150 + Math.floor(seededRandom(baseSeed) * 100),
    rotation: (seededRandom(baseSeed + 1) - 0.5) * 10,
    positionX: positions[Math.floor(seededRandom(baseSeed + 2) * positions.length)],
    positionY: verticals[Math.floor(seededRandom(baseSeed + 3) * verticals.length)],
    opacity: 0.7 + seededRandom(baseSeed + 4) * 0.3,
  };
}

/**
 * Calcula una seed única para cada ejecución basada en:
 * - loopNumber
 * - Timestamp (para cambio día a día)
 * - Hash del hash anterior (para continuidad dentro del mismo loop)
 */
export function generateSessionSeed(loopNumber: number): number {
  const now = new Date();
  const dateHash = now.getFullYear() * 10000 + now.getMonth() * 100 + now.getDate();
  return dateHash * 1000 + loopNumber;
}

/**
 * Configuración completa de un loop variado
 */
export interface LoopVariation {
  loopNumber: number;
  seed: number;
  materialOrder: MaterialBlockType[];
  burstPhrase: Phrase;
  peakVariation: PeakVariation;
  logoVariation: LogoVariation;
}

/**
 * Genera todas las variaciones para un loop completo
 * @param loopNumber Loop a generar (1-4)
 * @param customSeed Seed opcional (default: basado en fecha)
 */
export function generateFullLoopVariation(
  loopNumber: number,
  customSeed?: number
): LoopVariation {
  const seed = customSeed ?? generateSessionSeed(loopNumber);

  return {
    loopNumber,
    seed,
    materialOrder: generateMaterialOrder(loopNumber, seed),
    burstPhrase: selectBurstPhrase(loopNumber, seed + 1),
    peakVariation: generatePeakVariation(seed + 2),
    logoVariation: generateLogoVariation(seed + 3),
  };
}

/**
 * Genera todas las variaciones para los 4 loops
 * Con opción de seed global para replicar la misma sesión
 */
export function generateFullInstallationVariation(globalSeed?: number) {
  const seed = globalSeed ?? generateSessionSeed(0);
  return {
    seed,
    loop1: generateFullLoopVariation(1, seed + 1000),
    loop2: generateFullLoopVariation(2, seed + 2000),
    loop3: generateFullLoopVariation(3, seed + 3000),
    loop4: generateFullLoopVariation(4, seed + 4000),
  };
}
