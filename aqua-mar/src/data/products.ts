import type { Product } from "@/commerce/types";

/** Catálogo. Los productos se editan acá; nada de precios inventados:
 * price null muestra "Consultar precio". Venta solo por bulto cerrado
 * (ver commerceConfig.unitsPerBox). */
export const products: Product[] = [
  {
    id: "powerful-40",
    name: "Powerful 3 en 1",
    presentation: "40 cápsulas",
    image: "/products/powerful-40-envase.png",
    imagePosition: "50% 50%",
    shortDescription:
      "Rinde 40 lavados por envase. Se vende por bulto cerrado de 12 envases.",
    active: true,
    retailAvailable: false,
    wholesaleAvailable: true,
    price: null,
    stockStatus: "consultar",
  },
  {
    id: "powerful-20",
    name: "Powerful 3 en 1",
    presentation: "20 cápsulas",
    image: "/products/powerful-20-envase.png",
    imagePosition: "50% 50%",
    shortDescription:
      "Rinde 20 lavados por envase. Se vende por bulto cerrado de 12 envases.",
    active: true,
    retailAvailable: false,
    wholesaleAvailable: true,
    price: null,
    stockStatus: "consultar",
  },
];
