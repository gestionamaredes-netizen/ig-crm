// Control de acceso a IG CRM. Hay dos niveles:
//
//  - FULL_ACCESS  → ven todo el CRM (vos y tus socios).
//  - CAMBIO_ONLY  → entran y solo ven la caja de cambio (/cambio). Tu equipo.
//
// Para dar acceso a alguien, sumá su email a la lista que corresponda. Para
// sacarle el acceso, borralo: deja de entrar en el próximo login.
// Esta app es exclusiva de la caja de cambio (gestionesma.store): NADIE ve el
// resto del CRM desde acá. Por eso FULL_ACCESS está vacío y todos son cambio.
export const FULL_ACCESS: string[] = [];
export const CAMBIO_ONLY: string[] = [
  // Usuario ÚNICO compartido de la caja. El equipo entra escribiendo "Capi" en
  // el campo Usuario; el login lo mapea a este email interno (ver la pantalla
  // de login). No recibe correo: solo sirve para autenticar con contraseña.
  "capi@gestionesma.store",
  // Mails viejos (login por email). Se dejan para no cortar sesiones abiertas;
  // la pantalla de login ya no los ofrece.
  "blackcrm25@gmail.com",
  "blackrm25@gmail.com",
  "gestionama.redes@gmail.com",
  "gestionesma.consultora@gmail.com",
  "ortegafaben@gmail.com",
];

/**
 * ¿Está exigido el login? En producción, PRENDIDO salvo que se apague
 * explícitamente con NEXT_PUBLIC_AUTH_ENABLED="false". Así, si la variable
 * falta o queda mal escrita en el deploy, la app NO queda abierta: fallar
 * cerrado es la única opción segura para una herramienta con plata adentro.
 * En dev local sigue apagado salvo que se prenda a propósito con "true".
 */
export function authEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_AUTH_ENABLED;
  if (process.env.NODE_ENV === "production") return flag !== "false";
  return flag === "true";
}

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
