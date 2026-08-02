import { business } from "@/config";

/** Arma un link de WhatsApp con el mensaje ya escrito. */
export function waLink(message: string): string {
  return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const WA_MESSAGES = {
  pedido:
    "Hola Aqua Mar! Quiero pedir Powerful PODS 3 en 1 (balde de 40 cápsulas). ¿Me pasás precio y envío?",
  mayorista:
    "Hola Aqua Mar! Tengo un comercio y quiero la lista de precios mayoristas de Powerful.",
  cobertura:
    "Hola Aqua Mar! Quiero saber si hacen envíos a mi zona.",
  consulta:
    "Hola Aqua Mar! Quiero hacer una consulta sobre Powerful PODS.",
};
