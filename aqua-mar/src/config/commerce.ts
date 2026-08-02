/** Configuración comercial (Etapa 10). Sin precios ni stock inventados. */
export const commerceConfig = {
  currency: "ARS" as const,
  showPrices: false,
  enableRetailOrders: true,
  enableWholesaleOrders: true,
  enableCart: false,
  enableOnlinePayments: false,
  quantityOptions: {
    retail: ["1", "2", "3", "4", "5", "Más de 5"],
    wholesale: [
      "6 a 12 unidades",
      "13 a 24 unidades",
      "25 a 50 unidades",
      "Más de 50 unidades",
    ],
  },
};
