/** Configuración del panel interno. */
export const dashboardConfig = {
  /**
   * Roles del equipo. Hoy son informativos: con Supabase conectado,
   * toda cuenta creada en Authentication → Users tiene el mismo acceso.
   * Diferenciar permisos por rol queda para una próxima versión.
   */
  roles: ["administrador", "ventas", "marketing", "supervisor", "lectura"] as const,
  /**
   * El panel exige autenticación antes de mostrar datos reales:
   * - Con Supabase conectado: login real (email + contraseña por persona).
   * - Sin Supabase: candado por contraseña compartida y datos vacíos/demo.
   */
  requiresAuthBeforeRealData: true,
};
