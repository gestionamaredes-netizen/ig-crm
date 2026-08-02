import { businessConfig } from "@/config/business";
import { getUtmSuffix } from "./utm";

/**
 * Construye una URL válida de WhatsApp con el mensaje codificado.
 * Si el número no está configurado devuelve null para que la UI
 * pueda deshabilitar el botón en lugar de mostrar un link roto.
 */
export function getWhatsAppUrl(message: string): string | null {
  const number = (businessConfig.whatsapp ?? "").replace(/\D/g, "");
  if (!number) return null;
  const text = `${message}${getUtmSuffix()}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

/** Mensajes precargados. Venta exclusivamente mayorista por bulto
 * cerrado de 12 envases. */
export const WA_MESSAGES = {
  wholesale:
    "Hola Aqua Mar. Quiero comprar Powerful por mayor.\nNombre:\nComercio o emprendimiento:\nCiudad o provincia:\nPresentación (20 o 40 cápsulas):\nBultos estimados (cada bulto trae 12 envases):",
  coverage:
    "Hola Aqua Mar. Quiero saber si llegan a mi zona con pedidos mayoristas.\nLocalidad:\nProvincia:",
  general: "Hola Aqua Mar. Quiero hacer una consulta sobre Powerful.",
  presentation: (label: string) =>
    `Hola Aqua Mar. Quiero consultar por mayor por Powerful, ${label}.\nCiudad o provincia:\nBultos estimados:`,
};
