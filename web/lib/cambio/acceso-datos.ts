import { createClient } from "@/lib/supabase/server";

// Mapa runner_id → usuario de los accesos ya creados. Lo lee un admin (la RLS
// de perfiles_cambio le deja ver todas las filas); un runner solo vería la suya,
// pero esta pantalla es de admin. Sirve para no crear un acceso dos veces y para
// mostrar con qué usuario entra cada runner.
export async function getAccesosPorRunner(): Promise<Record<string, string>> {
  const sb = await createClient();
  const { data, error } = await sb
    .from("perfiles_cambio")
    .select("runner_id,usuario")
    .not("runner_id", "is", null);

  if (error) {
    console.error("[cambio] lectura de accesos falló:", error.message, error.details ?? "");
    return {};
  }

  const mapa: Record<string, string> = {};
  for (const row of data ?? []) {
    const r = row as { runner_id: string | null; usuario: string | null };
    if (r.runner_id) mapa[r.runner_id] = r.usuario ?? "";
  }
  return mapa;
}
