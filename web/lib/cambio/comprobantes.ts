import { createClient } from "@/lib/supabase/client";

export const TIPOS_COMPROBANTE = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
export const MAX_COMPROBANTE = 10 * 1024 * 1024; // 10 MB

/** Valida tipo y tamaño de un archivo antes de subirlo. Pura y testeable. */
export function validarComprobante(file: { type: string; size: number }): { ok: true } | { ok: false; error: string } {
  if (!TIPOS_COMPROBANTE.includes(file.type)) {
    return { ok: false, error: "Solo se aceptan imágenes (JPG, PNG, WEBP) o PDF." };
  }
  if (file.size > MAX_COMPROBANTE) {
    return { ok: false, error: "El archivo supera los 10 MB." };
  }
  return { ok: true };
}

/**
 * Sube un comprobante al bucket privado y devuelve su ruta. El nombre es un
 * uuid, sin datos sensibles. La subida corre como el usuario autenticado
 * (RLS), consistente con que la caja es privada.
 */
export async function subirComprobante(file: File): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const v = validarComprobante(file);
  if (!v.ok) return v;
  const ext = (file.name.split(".").pop() ?? "dat").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;
  const sb = createClient();
  const { error } = await sb.storage.from("comprobantes").upload(path, file, { upsert: false });
  if (error) {
    console.error("[cambio] subida de comprobante falló:", error.message);
    return { ok: false, error: "No se pudo subir el comprobante. Probá de nuevo." };
  }
  return { ok: true, path };
}

/** URL firmada temporal (1 hora) para ver un comprobante del bucket privado. */
export async function urlComprobante(path: string): Promise<string | null> {
  if (!path) return null;
  const sb = createClient();
  const { data, error } = await sb.storage.from("comprobantes").createSignedUrl(path, 3600);
  if (error) {
    console.error("[cambio] URL firmada de comprobante falló:", error.message);
    return null;
  }
  return data.signedUrl;
}
