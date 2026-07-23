// Control de acceso a IG CRM. Hay dos niveles:
//
//  - FULL_ACCESS  → ven todo el CRM (vos y tus socios).
//  - CAMBIO_ONLY  → entran y solo ven la caja de cambio (/cambio). Tu equipo.
//
// Para dar acceso a alguien, sumá su email a la lista que corresponda. Para
// sacarle el acceso, borralo: deja de entrar en el próximo login.
export const FULL_ACCESS = ["gestionama.redes@gmail.com", "gestionesma.consultora@gmail.com"];
export const CAMBIO_ONLY: string[] = ["ortegafaben@gmail.com"];

export type AccessTier = "full" | "cambio" | "none";

/** Nivel de acceso de un email. "none" = no autorizado a entrar. */
export function accessTier(email: string | null | undefined): AccessTier {
  if (!email) return "none";
  const e = email.toLowerCase();
  if (FULL_ACCESS.map((x) => x.toLowerCase()).includes(e)) return "full";
  if (CAMBIO_ONLY.map((x) => x.toLowerCase()).includes(e)) return "cambio";
  return "none";
}

/** Autorizado a entrar (cualquier nivel que no sea "none"). */
export function isAllowed(email: string | null | undefined): boolean {
  return accessTier(email) !== "none";
}

/** A dónde mandar a un usuario cuando entra sin una ruta concreta. */
export function landingPath(tier: AccessTier): string {
  return tier === "cambio" ? "/cambio" : "/dashboard";
}

/**
 * ¿Este nivel puede ver esta ruta de la app? El nivel "cambio" solo llega a
 * /cambio y sus subrutas (incluido /cambio/export). Todo lo demás se le
 * redirige. Es un bloqueo de navegación, no de la base de datos.
 */
export function canAccessPath(tier: AccessTier, path: string): boolean {
  if (tier === "full") return true;
  if (tier === "cambio") return path === "/cambio" || path.startsWith("/cambio/");
  return false;
}
