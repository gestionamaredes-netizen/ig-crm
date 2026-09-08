export const COLORS = {
  black: '#000000',
  blackTube: '#0B0A0A', // Negro que devuelve un CRT
  red: '#E01B1B', // Rojo Farra
  redBurn: '#FF2E2E', // Rojo quemado (solo glow, flash, saturación)
  redBlood: '#8B0F0F', // Sombras, degradés
  white: '#F5F0E8', // Blanco fósforo — default
  whiteFlash: '#FFFFFF', // Flashes y pico solamente
  winBlue: '#0000AA', // Pantalla azul (intruso)
  phosphorGreen: '#33FF33', // Display de celular (intruso)
} as const;

export const FONTS = {
  brand: {
    family: 'Playfair Display, Didot, serif',
    weight: 700,
  },
  giant: {
    family: 'Arial Black, Helvetica Bold, Anton, sans-serif',
    weight: 900,
    // grotesca condensada, bold, mayúsculas
  },
  screen: {
    family: 'Tahoma, MS Sans Serif, sans-serif',
    weight: 400,
    // sin antialias, pixeladas
  },
  timestamp: {
    family: 'VCR OSD Mono, monospace',
    weight: 400,
  },
  bailanta: {
    family: 'Arial, sans-serif',
    weight: 700,
    style: 'italic',
  },
} as const;

export type ColorKey = keyof typeof COLORS;
