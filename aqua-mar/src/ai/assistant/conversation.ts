import { sanitizeText } from "@/lib/validate";

/** Flujos guiados: mayorista y cobertura (slot filling).
 * La venta es solo mayorista, por bulto cerrado de 12 envases. */
export type FlowId = "wholesale" | "coverage";

type Slot = { key: string; question: string };

const FLOWS: Record<FlowId, { intro: string; slots: Slot[] }> = {
  wholesale: {
    intro: "Genial, armo tu consulta mayorista. Recordá que la venta es por bulto cerrado de 12 envases.",
    slots: [
      { key: "nombre", question: "¿Tu nombre?" },
      { key: "comercio", question: "¿Cómo se llama tu comercio o emprendimiento? (podés escribir \"omitir\")" },
      { key: "provincia", question: "¿Ciudad o provincia?" },
      { key: "presentacion", question: "¿Qué presentación te interesa: 20, 40 o ambas?" },
      { key: "bultos", question: "¿Cuántos bultos estimás? Cada bulto trae 12 envases." },
    ],
  },
  coverage: {
    intro: "Te preparo la consulta de cobertura.",
    slots: [
      { key: "localidad", question: "¿Cuál es tu localidad?" },
      { key: "provincia", question: "¿De qué provincia?" },
    ],
  },
};

export type ConversationState = {
  flow: FlowId | null;
  slotIndex: number;
  values: Record<string, string>;
  clarifications: number;
};

export const INITIAL_STATE: ConversationState = {
  flow: null,
  slotIndex: 0,
  values: {},
  clarifications: 0,
};

export function startFlow(flow: FlowId): { state: ConversationState; messages: string[] } {
  const f = FLOWS[flow];
  return {
    state: { flow, slotIndex: 0, values: {}, clarifications: 0 },
    messages: [f.intro, f.slots[0].question],
  };
}

export function stepFlow(
  state: ConversationState,
  input: string
): { state: ConversationState; messages: string[]; done: boolean } {
  if (!state.flow) return { state, messages: [], done: false };
  const f = FLOWS[state.flow];
  const slot = f.slots[state.slotIndex];
  const value = sanitizeText(input, 120);
  const values = { ...state.values };
  if (value && !/^omitir$/i.test(value)) values[slot.key] = value;

  const nextIndex = state.slotIndex + 1;
  if (nextIndex < f.slots.length) {
    return {
      state: { ...state, slotIndex: nextIndex, values },
      messages: [f.slots[nextIndex].question],
      done: false,
    };
  }
  return {
    state: { ...state, slotIndex: nextIndex, values },
    messages: [],
    done: true,
  };
}

/** Mensaje final para WhatsApp, sin campos vacíos. */
export function buildFlowMessage(state: ConversationState): string {
  const v = state.values;
  const lines = (parts: Array<string | false | undefined>) => parts.filter(Boolean).join("\n");
  if (state.flow === "coverage") {
    return lines([
      "Hola Aqua Mar. Quiero saber si llegan a mi zona con pedidos mayoristas.",
      v.localidad && `Localidad: ${v.localidad}`,
      v.provincia && `Provincia: ${v.provincia}`,
    ]);
  }
  return lines([
    "Hola Aqua Mar. Quiero comprar Powerful por mayor.",
    v.nombre && `Nombre: ${v.nombre}`,
    v.comercio && `Comercio o emprendimiento: ${v.comercio}`,
    v.presentacion && `Presentación: ${v.presentacion}`,
    v.bultos && `Bultos estimados: ${v.bultos}`,
    v.provincia && `Ciudad o provincia: ${v.provincia}`,
  ]);
}

/** Resumen legible para mostrar antes de abrir WhatsApp. */
export function flowSummary(state: ConversationState): string {
  const entries = Object.entries(state.values);
  if (entries.length === 0) return "Listo, preparé tu consulta.";
  const detalle = entries.map(([k, v]) => `${k}: ${v}`).join(" · ");
  return `Listo, preparé tu consulta (${detalle}). Tocá el botón para enviarla por WhatsApp: el equipo confirma disponibilidad, precio y entrega.`;
}
