import { createClient } from "@/lib/supabase/server";
import type { Perfil } from "./perfiles";

function uno<T>(rel: T | T[] | null): T | null {
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

type PerfilRow = {
  rol: "admin" | "runner";
  runner_id: string | null;
  runners: { name: string } | { name: string }[] | null;
};

/**
 * El perfil del usuario logueado. La RLS de perfiles_cambio ya limita la
 * lectura a la propia fila (o todas, si es admin), así que se filtra por
 * user_id = auth.uid() para traer exactamente una. `null` si no tiene perfil
 * (usuario sin cargar en perfiles_cambio): el llamador lo trata como "sin
 * acceso a datos" y muestra un aviso, nunca datos de otro.
 */
export async function getMiPerfil(): Promise<Perfil | null> {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;

  const { data, error } = await sb
    .from("perfiles_cambio")
    .select("rol,runner_id,runners(name)")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[cambio] lectura de perfil falló:", error.message, error.details ?? "");
    return null;
  }
  if (!data) return null;

  const row = data as unknown as PerfilRow;
  return {
    rol: row.rol,
    runnerId: row.runner_id,
    runnerNombre: uno(row.runners)?.name ?? "",
  };
}
