import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase para el servidor (lecturas y escrituras).
// Usa la publishable key; con RLS desactivado en Fase 1 puede leer/escribir.
export function supabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
