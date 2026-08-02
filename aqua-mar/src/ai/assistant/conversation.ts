import { sanitizeText } from "@/lib/validate";

/** Flujos guiados: minorista, mayorista y cobertura (slot filling). */
export type FlowId = "retail" | "wholesale" | "coverage";

type Slot = { key: string; question: string };

const FLOWS: Record<FlowId, { intro: string; slots: Slot[] }> = {
  retail: {
    intro: "Perfecto, preparo tu consulta minorista.",
    slots: [
      { key: "presentacion", question: "¿Qué presentación te interesa: 20 o 40 cápsulas?" },
      { key: "cantidad", question: "¿Cuántos envases querés consultar?" },
      { key: "localidad", question: "¿En qué localidad estás?" },
      { key: "provincia", question: "¿De qué provincia?" },
      { key: "nombre", question: "¿Tu nombre? (podés escribir \"omitir\")" },
    ],
  },
  wholesale: {
    intro: "Genial, armo tu consulta mayorista.",
    slots: [
      { key: "nombre", question: "¿Tu nombre?" },
      { key: "comercio", question: "¿Cómo se llama tu comercio o emprendimiento? (podés escribir \"omitir\")" },
      { key: "provincia", question: "¿Ciudad o provincia?" },
      { key: "presentacion", question: "¿Qué presentación te interesa: 20, 40 o ambas?" },
      { key: "cantidad", question: "¿Qué cantidad estimás por compra?" },
    ],
  },
  coverage: {
    intro: "Te preparo la consulta de cobertura.",
    slots: [
      { key: "localidad", question: "¿Cuál es tu localidad?" },
      { key: "provincia", question: "¿De qué provincia?" },
      { key: "tipo", question: "¿Tu pedido sería minorista o mayorista?" },
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
  if (state.flow === "wholesale") {
    return lines([
      "Hola Aqua Mar. Quiero recibir información comercial de Powerful.",
      "Tipo de compra: mayorista",
      v.nombre && `Nombre: ${v.nombre}`,
      v.comercio && `Comercio o emprendimiento: ${v.comercio}`,
      v.presentacion && `Presentación: ${v.presentacion}`,
      v.cantidad && `Cantidad estimada: ${v.cantidad}`,
      v.provincia && `Ciudad o provincia: ${v.provincia}`,
    ]);
  }
  if (state.flow === "coverage") {
    return lines([
      "Hola Aqua Mar. Quiero consultar si realizan entregas en mi zona.",
      v.localidad && `Localidad: ${v.localidad}`,
      v.provincia && `Provincia: ${v.provincia}`,
      v.tipo && `Tipo de pedido: ${v.tipo}`,
    ]);
  }
  return lines([
    "Hola Aqua Mar. Quiero consultar por Powerful.",
    "Tipo de compra: minorista",
    v.presentacion && `Presentación: ${v.presentacion}`,
    v.cantidad && `Cantidad: ${v.cantidad}`,
    v.nombre && `Nombre: ${v.nombre}`,
    v.localidad && `Localidad: ${v.localidad}`,
    v.provincia && `Provincia: ${v.provincia}`,
  ]);
}

/** Resumen legible para mostrar antes de abrir WhatsApp. */
export function flowSummary(state: ConversationState): string {
  const entries = Object.entries(state.values);
  if (entries.length === 0) return "Listo, preparé tu consulta.";
  const detalle = entries.map(([k, v]) => `${k}: ${v}`).join(" · ");
  return `Listo, preparé tu consulta (${detalle}). Tocá el botón para enviarla por WhatsApp: el equipo confirma disponibilidad, precio y entrega.`;
}
