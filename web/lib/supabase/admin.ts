import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente con la SERVICE ROLE KEY: saltea la RLS y puede administrar Auth
// (crear usuarios). SOLO se usa en server actions, nunca en el navegador —
// "server-only" hace que el build falle si alguien lo importa desde un
// componente cliente. La clave vive en SUPABASE_SERVICE_ROLE_KEY (sin
// NEXT_PUBLIC_, así nunca se manda al cliente).
//
// Devuelve null si la clave no está configurada, para que el llamador dé un
// mensaje claro en vez de romper.
export function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
