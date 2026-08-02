/** Generador central de mensajes de WhatsApp (Etapas 10 y 11).
 * Nunca incluye campos vacíos. */

export type OrderMessageInput = {
  customerType: "retail" | "wholesale";
  productName: string;
  presentation: string;
  quantity?: string;
  location?: string;
  customerName?: string;
  businessName?: string;
};

function lines(parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join("\n");
}

export function buildOrderMessage(input: OrderMessageInput): string {
  if (input.customerType === "wholesale") {
    return lines([
      "Hola Aqua Mar. Quiero recibir información mayorista de Powerful.",
      `Producto: ${input.productName}`,
      input.presentation && `Presentación: ${input.presentation}`,
      input.quantity && `Cantidad estimada: ${input.quantity}`,
      input.customerName && `Nombre: ${input.customerName}`,
      input.businessName && `Comercio o emprendimiento: ${input.businessName}`,
      input.location && `Ciudad o provincia: ${input.location}`,
    ]);
  }
  return lines([
    "Hola Aqua Mar. Quiero realizar una consulta por Powerful.",
    `Producto: ${input.productName}`,
    `Presentación: ${input.presentation}`,
    input.quantity && `Cantidad: ${input.quantity}`,
    input.location && `Localidad: ${input.location}`,
    input.customerName && `Nombre: ${input.customerName}`,
  ]);
}

/** Plantillas operativas para responder desde WhatsApp Business.
 * Se usan desde la guía operativa, no desde la web. */
export const OPERATIONAL_TEMPLATES = {
  bienvenida:
    "Hola, gracias por comunicarte con Aqua Mar.\nSomos distribuidores oficiales de Powerful en Zona Oeste y realizamos envíos a todo el país.\nPara ayudarte, contanos:\n• Tu nombre\n• Tu localidad o provincia\n• Presentación de interés\n• Cantidad aproximada\n• Si tu consulta es minorista o mayorista",
  respuestaMinorista: (nombre: string) =>
    `Hola, ${nombre}. Gracias por tu consulta.\nPowerful se encuentra disponible en presentaciones de 20 y 40 cápsulas.\nPara confirmar precio, disponibilidad y entrega, necesitamos:\n• Presentación\n• Cantidad\n• Localidad\n• Modalidad de entrega o envío`,
  respuestaMayorista: (nombre: string) =>
    `Hola, ${nombre}. Gracias por comunicarte con Aqua Mar.\nTrabajamos con comercios, revendedores y distribuidores.\nPara enviarte información comercial, indicanos:\n• Nombre del comercio o emprendimiento\n• Ciudad o provincia\n• Cantidad estimada\n• Frecuencia de compra\n• Presentación de interés`,
  seguimiento1: (nombre: string) =>
    `Hola, ${nombre}. Te escribimos para saber si pudiste revisar la información que te enviamos sobre Powerful.\nEstamos disponibles para ayudarte.`,
  seguimiento2: (nombre: string) =>
    `Hola, ${nombre}. Cerramos por ahora tu consulta para no molestarte.\nCuando necesites información sobre Powerful, podés volver a escribirnos.`,
  entregaFinalizada: (nombre: string) =>
    `Hola, ${nombre}. Queríamos confirmar que recibiste correctamente tu pedido de Powerful.\nGracias por elegir Aqua Mar.`,
};
