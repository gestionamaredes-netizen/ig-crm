/** Configuración de Aqua IA. */
export const assistantConfig = {
  enabled: true,
  name: "Aqua IA",
  descriptor: "Asistente comercial",
  storeConversations: false,
  enableHumanHandoff: true,
  enableRetailFlow: false, // venta exclusivamente mayorista
  enableWholesaleFlow: true,
  enableCoverageFlow: true,
  maxClarificationAttempts: 1,
  welcome:
    "Hola, soy Aqua IA. Te ayudo con información de Powerful y pedidos mayoristas: vendemos por bulto cerrado de 12 envases, con envíos a todo el país.",
  privacyNote:
    "No compartas contraseñas, datos bancarios ni información sensible. La conversación se utiliza únicamente para orientarte y preparar tu consulta.",
};
