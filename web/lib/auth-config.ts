// Emails autorizados a entrar a IG CRM. Sumá acá a quien quieras darle acceso.
export const ALLOWED_EMAILS = ["gestionama.redes@gmail.com"];

export function isAllowed(email: string | null | undefined): boolean {
  if (!email) return false;
  return ALLOWED_EMAILS.map((e) => e.toLowerCase()).includes(email.toLowerCase());
}
