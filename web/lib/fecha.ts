/**
 * Sin dependencias de Supabase ni de Next: a diferencia de lib/finanzas/datos.ts
 * y lib/cambio/datos.ts (que arrastran `next/headers` por el cliente de
 * servidor), este módulo se puede importar tal cual desde un componente
 * "use client" sin que Turbopack rechace el build.
 */

/** Fecha de hoy en YYYY-MM-DD, hora local. */
export function hoyISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
