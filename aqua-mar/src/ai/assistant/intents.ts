/** Detección de intención por reglas locales. Sin datos sensibles. */
export type AssistantIntent =
  | "greeting"
  | "product_information"
  | "presentation_20"
  | "presentation_40"
  | "retail_purchase"
  | "wholesale_purchase"
  | "coverage"
  | "shipping"
  | "product_use"
  | "price"
  | "stock"
  | "contact"
  | "human_support"
  | "company"
  | "unknown";

const RULES: Array<{ intent: AssistantIntent; pattern: RegExp }> = [
  { intent: "human_support", pattern: /(humano|persona|asesor|atienda|hablar con alguien|operador)/i },
  { intent: "price", pattern: /(precio|cu[aá]nto (sale|cuesta|vale)|valor|cotiza|lista de precio|\$)/i },
  { intent: "stock", pattern: /(stock|disponib|hay (powerful|envases|c[aá]psulas)|les queda)/i },
  { intent: "wholesale_purchase", pattern: /(mayor(ista|eo)?|revend|distribu(ir|idor)|comercio|negocio|kiosco|almac[eé]n|perfumer[ií]a|emprendimiento|por bulto|caja cerrada)/i },
  { intent: "presentation_20", pattern: /\b20\b|veinte/i },
  { intent: "presentation_40", pattern: /\b40\b|cuarenta/i },
  { intent: "shipping", pattern: /(env[ií]o|mandan|llega|despach|correo|transporte|interior|provincia)/i },
  { intent: "coverage", pattern: /(cobertura|zona oeste|mi zona|localidad|entregan en|llegan a)/i },
  { intent: "product_use", pattern: /(c[oó]mo se usa|como usar|modo de uso|instrucciones|lavarropas|tambor)/i },
  { intent: "retail_purchase", pattern: /(comprar|pedido|pedir|quiero (uno|powerful|un envase)|para (mi )?casa|uso personal)/i },
  { intent: "product_information", pattern: /(powerful|c[aá]psula|producto|3 en 1|presentaci[oó]n|qu[eé] venden)/i },
  { intent: "contact", pattern: /(contacto|whatsapp|instagram|correo|mail|tel[eé]fono)/i },
  { intent: "company", pattern: /(aqua ?mar|qui[eé]nes son|de d[oó]nde son|son oficiales)/i },
  { intent: "greeting", pattern: /^(hola|buenas|buen d[ií]a|buenas tardes|buenas noches|hey|hi)\b/i },
];

export function detectIntent(text: string): AssistantIntent {
  const clean = text.trim();
  if (!clean) return "unknown";
  for (const rule of RULES) {
    if (rule.pattern.test(clean)) return rule.intent;
  }
  return "unknown";
}
