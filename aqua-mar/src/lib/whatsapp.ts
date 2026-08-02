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

export const WA_MESSAGES = {
  retail:
    "Hola Aqua Mar. Quiero consultar por Powerful para uso personal.\nPresentación de interés:\nLocalidad:\nCantidad aproximada:",
  wholesale:
    "Hola Aqua Mar. Quiero recibir información para comprar Powerful por mayor.\nNombre:\nComercio o emprendimiento:\nCiudad o provincia:\nCantidad estimada:",
  coverage:
    "Hola Aqua Mar. Quiero consultar si realizan entregas en mi zona.\nLocalidad:\nProvincia:\nTipo de pedido: minorista / mayorista",
  general: "Hola Aqua Mar. Quiero hacer una consulta sobre Powerful.",
  presentation: (label: string) =>
    `Hola Aqua Mar. Quiero consultar por Powerful, ${label}.\nLocalidad:\nCantidad aproximada:`,
};
