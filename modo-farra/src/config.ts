export const CONFIG = {
  WIDTH: 1920,
  HEIGHT: 1080,
  FPS: 30,
  DURATION_FRAMES: 3300, // 110s = 1:50
  CODEC: 'h264',
  CRF: 16,
  AUDIO_SAMPLE_RATE: 48000,
  PIXEL_FORMAT: 'yuv420p',
} as const;

export type Config = typeof CONFIG;
