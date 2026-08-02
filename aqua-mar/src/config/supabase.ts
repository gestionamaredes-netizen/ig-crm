/**
 * Conexión a Supabase (base de datos compartida + login del equipo).
 *
 * Cómo conectar (guía completa en docs/SUPABASE.md):
 * 1. Crear el proyecto en https://supabase.com
 * 2. Correr supabase/schema.sql en el SQL Editor
 * 3. Copiar Project URL y anon public key desde Settings → API
 *    y pegarlos acá abajo (o en las variables de Netlify).
 *
 * La anon key está pensada para ser pública: sola no deja leer ni
 * escribir nada, porque las tablas exigen usuario logueado (RLS).
 * Los secretos de verdad (service_role) NUNCA van en este archivo.
 *
 * Con estos dos valores vacíos, el panel funciona como hasta ahora:
 * candado por contraseña y datos vacíos/demo, sin base conectada.
 */
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

export const isSupabaseConfigured = Boolean(
  supabaseConfig.url && supabaseConfig.anonKey
);
