// Acceso de los runners a la caja. El equipo entra con un USUARIO (ej. "ori"),
// no con un email: Supabase Auth trabaja con emails, así que el usuario se mapea
// a un email interno del dominio de la caja ("ori@gestionesma.store"). Ese email
// no recibe correo, solo autentica. Estas funciones son puras y las comparten la
// pantalla de login, el middleware y el alta de accesos.

export const DOMINIO_USUARIO = "gestionesma.store";

/** Normaliza el usuario tal como se guarda/consulta: minúsculas, sin espacios. */
export function normalizarUsuario(usuario: string): string {
  return usuario.trim().toLowerCase().replace(/\s+/g, "");
}

/** "Ori" → "ori@gestionesma.store". */
export function usuarioAEmail(usuario: string): string {
  return `${normalizarUsuario(usuario)}@${DOMINIO_USUARIO}`;
}

/**
 * ¿El usuario tiene un formato válido para crear un acceso? Solo letras, números
 * y puntos, entre 2 y 30 caracteres. Sin espacios ni arroba: el arroba y el
 * dominio los pone el sistema. Devuelve un mensaje de error o null si está ok.
 */
export function validarUsuario(usuario: string): string | null {
  const u = normalizarUsuario(usuario);
  if (u.length < 2) return "El usuario es muy corto.";
  if (u.length > 30) return "El usuario es muy largo.";
  if (!/^[a-z0-9.]+$/.test(u)) return "El usuario solo puede tener letras, números y puntos (sin espacios ni símbolos).";
  return null;
}

/** ¿La clave inicial es aceptable? Mínimo 6, como pide Supabase. */
export function validarClave(clave: string): string | null {
  if (clave.length < 6) return "La contraseña tiene que tener al menos 6 caracteres.";
  return null;
}

/** Clave inicial por defecto para los runners nuevos (cada uno la cambia luego). */
export const CLAVE_INICIAL_DEFAULT = "gestionma2026";
