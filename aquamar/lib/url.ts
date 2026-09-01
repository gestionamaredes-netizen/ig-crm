import "server-only";
import { headers } from "next/headers";

/**
 * Base pública de la app, tomada del pedido en curso: el mismo código sirve en
 * localhost y en el dominio donde se publique, sin variable de entorno.
 */
export async function baseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const protocolo = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocolo}://${host}`;
}
