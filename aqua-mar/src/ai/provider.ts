import { KNOWLEDGE } from "./knowledge";
import { detectIntent, type AssistantIntent } from "./assistant/intents";
import { checkGuardrails } from "./assistant/guardrails";
import {
  startFlow,
  stepFlow,
  buildFlowMessage,
  flowSummary,
  INITIAL_STATE,
  type ConversationState,
  type FlowId,
} from "./assistant/conversation";
import { assistantConfig } from "@/config/assistant";

export type AssistantRequest = {
  text: string;
  state: ConversationState;
};

export type AssistantResponse = {
  messages: string[];
  state: ConversationState;
  quickReplies?: string[];
  whatsappMessage?: string;
  handoff?: boolean;
  intent?: AssistantIntent;
};

export interface AIProvider {
  generateResponse(input: AssistantRequest): Promise<AssistantResponse>;
}

const DEFAULT_REPLIES = [
  "Ver presentaciones",
  "Consultar por mayor",
  "Consultar cobertura",
  "Hablar por WhatsApp",
];

const QUICK_REPLY_FLOWS: Record<string, FlowId> = {
  "Consultar por mayor": "wholesale",
  "Consultar cobertura": "coverage",
};

/**
 * Proveedor inicial: reglas locales sobre la base de conocimiento
 * aprobada. La interfaz AIProvider permite sumar adaptadores futuros
 * (OpenAI, Anthropic, Gemini) del lado servidor, sin exponer claves.
 */
export class LocalRulesProvider implements AIProvider {
  async generateResponse({ text, state }: AssistantRequest): Promise<AssistantResponse> {
    // Acciones rápidas que inician flujos
    const flowFromQuickReply = QUICK_REPLY_FLOWS[text];
    if (flowFromQuickReply) {
      const started = startFlow(flowFromQuickReply);
      return { messages: started.messages, state: started.state, intent: "greeting" };
    }
    if (text === "Ver presentaciones") {
      return {
        messages: [KNOWLEDGE.presentation20, KNOWLEDGE.presentation40, KNOWLEDGE.price],
        state,
        quickReplies: ["Consultar por mayor", "Hablar por WhatsApp"],
        intent: "product_information",
      };
    }
    if (text === "Hablar por WhatsApp") {
      return {
        messages: [KNOWLEDGE.handoff],
        state,
        whatsappMessage: "Hola Aqua Mar. Quiero hacer una consulta sobre Powerful.",
        handoff: true,
        intent: "human_support",
      };
    }

    // Guardrails primero
    const guard = checkGuardrails(text);
    if (guard.blocked) {
      return {
        messages: [guard.response],
        state,
        handoff: guard.handoff,
        whatsappMessage: guard.handoff
          ? "Hola Aqua Mar. Necesito ayuda con una consulta."
          : undefined,
        quickReplies: guard.handoff ? undefined : DEFAULT_REPLIES,
        intent: "unknown",
      };
    }

    // Si hay un flujo activo, el texto responde la pregunta actual
    if (state.flow) {
      const step = stepFlow(state, text);
      if (!step.done) {
        return { messages: step.messages, state: step.state };
      }
      const message = buildFlowMessage(step.state);
      return {
        messages: [flowSummary(step.state)],
        state: { ...INITIAL_STATE },
        whatsappMessage: message,
        intent: state.flow === "coverage" ? "coverage" : "wholesale_purchase",
      };
    }

    // Detección de intención
    const intent = detectIntent(text);
    switch (intent) {
      case "greeting":
        return {
          messages: [assistantConfig.welcome],
          state,
          quickReplies: DEFAULT_REPLIES,
          intent,
        };
      case "company":
        return { messages: [KNOWLEDGE.company], state, quickReplies: DEFAULT_REPLIES, intent };
      case "product_information":
        return {
          messages: [KNOWLEDGE.product],
          state,
          quickReplies: ["Ver presentaciones", "Consultar por mayor"],
          intent,
        };
      case "presentation_20":
        return {
          messages: [KNOWLEDGE.presentation20],
          state,
          quickReplies: ["Consultar por mayor", "Hablar por WhatsApp"],
          intent,
        };
      case "presentation_40":
        return {
          messages: [KNOWLEDGE.presentation40],
          state,
          quickReplies: ["Consultar por mayor", "Hablar por WhatsApp"],
          intent,
        };
      case "price":
        return {
          messages: [KNOWLEDGE.price],
          state,
          quickReplies: ["Consultar por mayor", "Hablar por WhatsApp"],
          intent,
        };
      case "stock":
        return {
          messages: [KNOWLEDGE.stock],
          state,
          quickReplies: ["Consultar por mayor", "Hablar por WhatsApp"],
          intent,
        };
      case "retail_purchase":
        // Venta minorista: no existe. Se informa y se ofrece la vía mayorista.
        return {
          messages: [KNOWLEDGE.retail],
          state,
          quickReplies: ["Consultar por mayor", "Hablar por WhatsApp"],
          intent,
        };
      case "wholesale_purchase": {
        const started = startFlow("wholesale");
        return { messages: started.messages, state: started.state, intent };
      }
      case "coverage":
      case "shipping": {
        return {
          messages: [KNOWLEDGE.coverage],
          state,
          quickReplies: ["Consultar cobertura", "Hablar por WhatsApp"],
          intent,
        };
      }
      case "product_use":
        return { messages: [KNOWLEDGE.productUse], state, quickReplies: DEFAULT_REPLIES, intent };
      case "contact":
        return {
          messages: [KNOWLEDGE.contact],
          state,
          quickReplies: ["Hablar por WhatsApp"],
          intent,
        };
      case "human_support":
        return {
          messages: [KNOWLEDGE.handoff],
          state,
          whatsappMessage: "Hola Aqua Mar. Quiero hablar con el equipo por una consulta.",
          handoff: true,
          intent,
        };
      default: {
        // Un intento de aclaración; después, derivación humana
        if (state.clarifications < assistantConfig.maxClarificationAttempts) {
          return {
            messages: [
              "¿Podés contarme un poco más? Puedo ayudarte con presentaciones, pedidos mayoristas y cobertura.",
            ],
            state: { ...state, clarifications: state.clarifications + 1 },
            quickReplies: DEFAULT_REPLIES,
            intent,
          };
        }
        return {
          messages: [KNOWLEDGE.noInfo, KNOWLEDGE.handoff],
          state: { ...state, clarifications: 0 },
          whatsappMessage: "Hola Aqua Mar. Tengo una consulta para el equipo.",
          handoff: true,
          intent,
        };
      }
    }
  }
}

export const assistantProvider: AIProvider = new LocalRulesProvider();
