import type { SupabaseClient } from "@supabase/supabase-js";
import { accessTier, type AccessTier } from "@/lib/auth-config";

// Nivel de acceso combinando dos fuentes, en orden:
//  1. La lista fija del código (dueños del CRM y equipo histórico de la caja).
//  2. La base: cualquier usuario con fila en `perfiles_cambio` (los runners que
//     se crean desde la app). Así se pueden dar de alta accesos nuevos sin
//     tocar el código ni redesplegar.
//
// Fallar cerrado: si no matchea ninguna fuente, "none" (no entra). Un error de
// lectura también cae en "none" — preferimos negar el acceso antes que abrirlo
// por un problema de red.
export async function resolverTier(
  sb: SupabaseClient,
  email: string | null | undefined,
  userId: string | null | undefined,
): Promise<AccessTier> {
  const fijo = accessTier(email);
  if (fijo !== "none") return fijo;
  if (!userId) return "none";

  const { data, error } = await sb
    .from("perfiles_cambio")
    .select("rol")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return "none";
  return data.rol === "runner" ? "runner" : "cambio";
}
