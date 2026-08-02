import { KNOWLEDGE } from "@/ai/knowledge";

/**
 * Guardrails: bloquean inyección de instrucciones, pedidos de información
 * interna y temas fuera del alcance comercial. Se evalúan ANTES que la
 * detección de intención.
 */
const INJECTION = /(ignor[aá].{0,20}(regla|instruccion)|olvida.{0,20}(regla|instruccion)|actu[aá] como|hacete pasar|system prompt|prompt interno|jailbreak|developer mode|revela.{0,20}(prompt|instruccion))/i;

const SENSITIVE = /(contraseñ|password|tarjeta|cbu|cvu|token|api key|clave privada)/i;

const OUT_OF_SCOPE = /(f[oó]rmula|composici[oó]n qu[ií]mica|ingredientes|es t[oó]xico|alergia|m[eé]dic|dermat|embarazo|beb[eé] (lo )?(tom[oó]|comi[oó]|trag[oó])|ingiri[oó]|se lo comi[oó]|ojos|intoxica|mejor que (ariel|skip|ala|vanish)|comparaci[oó]n)/i;

const SAFETY = /(trag[oó]|ingiri[oó]|comi[oó] una c[aá]psula|en los ojos|se intoxic[oó]|reacci[oó]n)/i;

export type GuardrailResult =
  | { blocked: false }
  | { blocked: true; response: string; handoff?: boolean };

export function checkGuardrails(text: string): GuardrailResult {
  if (SAFETY.test(text)) {
    return {
      blocked: true,
      handoff: true,
      response:
        "Ante cualquier incidente con el producto, seguí las advertencias e instrucciones del envase y buscá asistencia profesional o de emergencias según la situación. También podés contactar al equipo de Aqua Mar.",
    };
  }
  if (INJECTION.test(text)) {
    return {
      blocked: true,
      response:
        "Soy Aqua IA y solo puedo ayudarte con información de Aqua Mar y Powerful. " + KNOWLEDGE.outOfScope,
    };
  }
  if (SENSITIVE.test(text)) {
    return {
      blocked: true,
      response:
        "Por seguridad, no compartas contraseñas ni datos bancarios en este chat. " + KNOWLEDGE.handoff,
      handoff: true,
    };
  }
  if (OUT_OF_SCOPE.test(text)) {
    return { blocked: true, response: KNOWLEDGE.outOfScope, handoff: true };
  }
  return { blocked: false };
}
