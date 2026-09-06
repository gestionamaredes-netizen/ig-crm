export type PhraseFamily =
  | 'MSN'
  | 'FOTOLOG'
  | 'CELULARES'
  | 'MUSICA'
  | 'TV'
  | 'PREVIA'
  | 'BOLICHE'
  | 'SISTEMA'
  | 'OTRAS';

export interface Phrase {
  id: number;
  text: string;
  family: PhraseFamily;
  loops: number[]; // 1-4 para indicar en qué loops va
  weight: number; // 1 = peso bajo (rota), 10 = peso alto (20 esenciales)
}

const ESSENTIAL_20 = [
  'ESTA TE LA SABÉS',
  '¿ESTÁS EN MSN?',
  'PONE ESA',
  'UNA MÁS Y NOS VAMOS',
  'HOY SE SALE',
  '¿DÓNDE ESTÁS?',
  'YA SALGO',
  'FIRMAME',
  'NO CAMBIES DE CANAL',
  'MENTIRA.',
  '¿QUIÉN TIENE CD?',
  'PASAME EL TEMA',
  'LLAMAME',
  'SIN SEÑAL',
  'SE ARMÓ',
  '5/5',
  'LA ÚLTIMA',
  'CONECTANDO...',
  'ESTO RECIÉN EMPIEZA',
  'NO SE VA NADIE',
];

export const PHRASES: Phrase[] = [
  // MSN
  { id: 1, text: '¿ESTÁS EN MSN?', family: 'MSN', loops: [2], weight: 10 },
  { id: 2, text: 'FIRMAME', family: 'MSN', loops: [2], weight: 10 },
  { id: 3, text: 'ESTÁ ESCRIBIENDO...', family: 'MSN', loops: [2], weight: 3 },
  { id: 4, text: 'TE AGREGUÉ', family: 'MSN', loops: [2], weight: 2 },
  { id: 5, text: 'ESTOY OCUPADO', family: 'MSN', loops: [1, 2], weight: 2 },
  { id: 6, text: 'NO DISPONIBLE', family: 'MSN', loops: [2], weight: 2 },
  { id: 7, text: 'ZUMBIDO', family: 'MSN', loops: [2], weight: 2 },
  { id: 8, text: 'ME BLOQUEASTE', family: 'MSN', loops: [2], weight: 1 },
  { id: 9, text: 'AHORA VUELVO', family: 'MSN', loops: [2], weight: 2 },
  { id: 10, text: 'CONECTADO', family: 'MSN', loops: [2], weight: 2 },

  // FOTOLOG
  { id: 11, text: '5/5', family: 'FOTOLOG', loops: [2], weight: 10 },
  { id: 12, text: 'FIRMO Y VUELVO', family: 'FOTOLOG', loops: [2], weight: 2 },
  { id: 13, text: 'ÚLTIMOS 20', family: 'FOTOLOG', loops: [2], weight: 2 },
  { id: 14, text: 'GRACIAS X PASAR', family: 'FOTOLOG', loops: [2], weight: 2 },
  { id: 15, text: 'FOTO NUEVA', family: 'FOTOLOG', loops: [2], weight: 1 },
  { id: 16, text: 'DEVUELVO SIEMPRE', family: 'FOTOLOG', loops: [2], weight: 1 },
  { id: 17, text: 'PASÁ POR EL MÍO', family: 'FOTOLOG', loops: [2], weight: 1 },
  { id: 18, text: 'COMENTARIOS: 0', family: 'FOTOLOG', loops: [2], weight: 1 },

  // CELULARES Y SMS
  { id: 19, text: '¿DÓNDE ESTÁS?', family: 'CELULARES', loops: [1, 4], weight: 10 },
  { id: 20, text: 'YA SALGO', family: 'CELULARES', loops: [4], weight: 10 },
  { id: 21, text: 'LLAMAME', family: 'CELULARES', loops: [1, 2], weight: 10 },
  { id: 22, text: 'SIN SEÑAL', family: 'CELULARES', loops: [1, 2], weight: 10 },
  { id: 23, text: 'BATERÍA BAJA', family: 'CELULARES', loops: [1], weight: 2 },
  { id: 24, text: 'NO TENGO CRÉDITO', family: 'CELULARES', loops: [1], weight: 2 },
  { id: 25, text: 'TOCÁ Y CORTO', family: 'CELULARES', loops: [1], weight: 2 },
  { id: 26, text: 'HACEME UNA PERDIDA', family: 'CELULARES', loops: [1], weight: 2 },
  { id: 27, text: '5 MENSAJES NUEVOS', family: 'CELULARES', loops: [1], weight: 1 },
  { id: 28, text: 'NO ME LLEGÓ', family: 'CELULARES', loops: [1], weight: 1 },
  { id: 29, text: 'MANDAME LA DIRECCIÓN', family: 'CELULARES', loops: [4], weight: 1 },
  { id: 30, text: 'ESTOY LLEGANDO', family: 'CELULARES', loops: [4], weight: 1 },

  // MÚSICA, CD Y MP3
  { id: 31, text: 'PONE ESA', family: 'MUSICA', loops: [3], weight: 10 },
  { id: 32, text: '¿QUIÉN TIENE CD?', family: 'MUSICA', loops: [3], weight: 10 },
  { id: 33, text: 'PASAME EL TEMA', family: 'MUSICA', loops: [3], weight: 10 },
  { id: 34, text: 'ESTÁ RAYADO', family: 'MUSICA', loops: [3], weight: 2 },
  { id: 35, text: 'SUBILE', family: 'MUSICA', loops: [3], weight: 2 },
  { id: 36, text: 'OTRA VEZ ESA', family: 'MUSICA', loops: [3], weight: 2 },
  { id: 37, text: 'GRABALO', family: 'MUSICA', loops: [3], weight: 2 },
  { id: 38, text: 'VOLVELA A PONER', family: 'MUSICA', loops: [3], weight: 2 },
  { id: 39, text: 'ESA NO', family: 'MUSICA', loops: [3], weight: 2 },
  { id: 40, text: 'DALE PLAY', family: 'MUSICA', loops: [3], weight: 1 },

  // TELEVISIÓN
  { id: 41, text: 'NO CAMBIES DE CANAL', family: 'TV', loops: [1], weight: 10 },
  { id: 42, text: 'YA VOLVEMOS', family: 'TV', loops: [1], weight: 2 },
  { id: 43, text: 'NO TOQUES LA ANTENA', family: 'TV', loops: [1], weight: 2 },
  { id: 44, text: 'ESTÁN DANDO ESA', family: 'TV', loops: [1], weight: 1 },
  { id: 45, text: 'AJUSTE DE IMAGEN', family: 'TV', loops: [1], weight: 1 },
  { id: 46, text: 'GRABALO EN VHS', family: 'TV', loops: [1], weight: 1 },
  { id: 47, text: 'SUBTITULADO', family: 'TV', loops: [1], weight: 1 },
  { id: 48, text: 'VIVO', family: 'TV', loops: [1], weight: 1 },

  // PREVIA Y SALIDA
  { id: 49, text: 'HOY SE SALE', family: 'PREVIA', loops: [4], weight: 10 },
  { id: 50, text: 'UNA MÁS Y NOS VAMOS', family: 'PREVIA', loops: [4], weight: 10 },
  { id: 51, text: 'PASO POR TU CASA', family: 'PREVIA', loops: [4], weight: 2 },
  { id: 52, text: '¿A QUÉ HORA?', family: 'PREVIA', loops: [4], weight: 2 },
  { id: 53, text: 'NOS VEMOS ALLÁ', family: 'PREVIA', loops: [4], weight: 2 },
  { id: 54, text: 'ESTOY EN 10', family: 'PREVIA', loops: [4], weight: 2 },
  { id: 55, text: '¿QUIÉN MANEJA?', family: 'PREVIA', loops: [4], weight: 1 },
  { id: 56, text: 'DALE QUE ES TARDE', family: 'PREVIA', loops: [4], weight: 1 },
  { id: 57, text: 'ME CAMBIO Y SALGO', family: 'PREVIA', loops: [4], weight: 1 },
  { id: 58, text: '¿VOS VENÍS?', family: 'PREVIA', loops: [4], weight: 1 },
  { id: 59, text: 'AVISÁ CUANDO LLEGUES', family: 'PREVIA', loops: [4], weight: 1 },
  { id: 60, text: 'NO ME ESPERES', family: 'PREVIA', loops: [4], weight: 1 },

  // BOLICHE
  { id: 61, text: 'HASTA LA 1 GRATIS', family: 'BOLICHE', loops: [4], weight: 2 },
  { id: 62, text: 'LISTA CERRADA', family: 'BOLICHE', loops: [4], weight: 2 },
  { id: 63, text: '¿ESTÁS EN LA LISTA?', family: 'BOLICHE', loops: [4], weight: 2 },
  { id: 64, text: 'LA ÚLTIMA', family: 'BOLICHE', loops: [4], weight: 10 },
  { id: 65, text: 'QUEDATE UN RATO MÁS', family: 'BOLICHE', loops: [4], weight: 2 },
  { id: 66, text: 'AFUERA HAY COLA', family: 'BOLICHE', loops: [4], weight: 2 },
  { id: 67, text: 'SE ARMÓ', family: 'BOLICHE', loops: [3, 4], weight: 10 },
  { id: 68, text: 'NO SE VA NADIE', family: 'BOLICHE', loops: [4], weight: 10 },
  { id: 69, text: 'VAMOS ADELANTE', family: 'BOLICHE', loops: [4], weight: 2 },
  { id: 70, text: 'ESTO RECIÉN EMPIEZA', family: 'BOLICHE', loops: [4], weight: 10 },

  // SISTEMA Y ERROR
  { id: 71, text: 'CONECTANDO...', family: 'SISTEMA', loops: [2], weight: 10 },
  { id: 72, text: 'NO RESPONDE', family: 'SISTEMA', loops: [2], weight: 3 },
  { id: 73, text: 'SE CORTÓ', family: 'SISTEMA', loops: [2], weight: 3 },
  { id: 74, text: '¿SEGURO QUE QUERÉS SALIR?', family: 'SISTEMA', loops: [2], weight: 2 },
  { id: 75, text: 'GUARDAR CAMBIOS', family: 'SISTEMA', loops: [2], weight: 2 },
  { id: 76, text: 'ERROR', family: 'SISTEMA', loops: [2], weight: 3 },
  { id: 77, text: 'CARGANDO', family: 'SISTEMA', loops: [2], weight: 2 },
  { id: 78, text: 'REINICIAR', family: 'SISTEMA', loops: [2], weight: 2 },

  // LAS DOS QUE NO ENTRAN EN NINGUNA FAMILIA
  { id: 79, text: 'MENTIRA.', family: 'OTRAS', loops: [1, 2, 3, 4], weight: 10 },
  { id: 80, text: 'ESTA TE LA SABÉS', family: 'OTRAS', loops: [1, 2, 3, 4], weight: 10 },
];

export function getPhrasesByLoop(loop: number): Phrase[] {
  return PHRASES.filter((p) => p.loops.includes(loop));
}

export function getEssentialPhrases(): Phrase[] {
  return PHRASES.filter((p) => ESSENTIAL_20.includes(p.text));
}
