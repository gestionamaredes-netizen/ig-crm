/**
 * Acceso al panel interno (/panel).
 *
 * La contraseña NO se guarda en texto plano: acá vive su hash SHA-256.
 * Contraseña inicial: "AquaMar2026" — CAMBIARLA antes de compartir el
 * panel. Para generar el hash de una nueva:
 *   echo -n "TuNuevaContraseña" | sha256sum
 * y pegar el resultado acá o en la variable NEXT_PUBLIC_PANEL_PASSWORD_HASH
 * de Netlify (la variable tiene prioridad).
 *
 * LÍMITE DE SEGURIDAD: en un sitio estático este candado corre en el
 * navegador; frena curiosos pero no a un atacante decidido. Es adecuado
 * mientras el panel solo muestre datos vacíos o de demostración.
 *
 * NOTA: cuando Supabase está conectado (src/config/supabase.ts), este
 * candado se reemplaza solo por el login real de Supabase Auth: cada
 * persona del equipo entra con su email y contraseña propios.
 */
export const panelAccess = {
  enabled: true,
  passwordHash:
    process.env.NEXT_PUBLIC_PANEL_PASSWORD_HASH ??
    "f84613c83e480c08a3b3cc3f5390544f37850003521a61daa29ffaa5a5745ed1",
  sessionKey: "aquamar_panel_session",
};
