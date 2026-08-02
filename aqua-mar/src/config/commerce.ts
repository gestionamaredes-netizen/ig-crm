/** Configuración comercial. Sin precios ni stock inventados.
 * Aqua Mar vende EXCLUSIVAMENTE al por mayor, por bulto cerrado. */
export const commerceConfig = {
  currency: "ARS" as const,
  showPrices: false,
  wholesaleOnly: true,
  /** Envases por bulto cerrado (aplica a 20 y 40 cápsulas). */
  unitsPerBox: 12,
  enableRetailOrders: false,
  enableWholesaleOrders: true,
  enableCart: false,
  enableOnlinePayments: false,
  quantityOptions: {
    retail: [] as string[], // sin venta minorista
    wholesale: [
      "1 bulto (12 envases)",
      "2 bultos (24 envases)",
      "3 a 5 bultos",
      "Más de 5 bultos",
    ],
  },
};
