import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig, isSupabaseConfigured } from "@/config/supabase";

let client: SupabaseClient | null = null;

/** Cliente único de Supabase; null si la conexión no está configurada. */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(supabaseConfig.url, supabaseConfig.anonKey);
  }
  return client;
}

export { isSupabaseConfigured };
