/** Feature flags. Activan o desactivan módulos sin tocar componentes. */
export const featureFlags = {
  retail: false, // venta exclusivamente mayorista
  wholesale: true,
  analytics: true,
  assistant: true,
  dashboard: true,
  blog: false,
  checkout: false,
  crm: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;
