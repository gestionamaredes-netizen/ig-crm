/** Configuración del panel interno. */
export const dashboardConfig = {
  /** Roles previstos para cuando se conecte autenticación real. */
  roles: ["administrador", "ventas", "marketing", "supervisor", "lectura"] as const,
  /**
   * IMPORTANTE: el panel no tiene login todavía porque solo muestra
   * datos vacíos o de demostración. Antes de conectar datos reales,
   * proteger la ruta (Netlify password / Identity / auth propia).
   */
  requiresAuthBeforeRealData: true,
};
