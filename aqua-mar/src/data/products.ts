import type { Product } from "@/commerce/types";

/** Catálogo. Los productos se editan acá; nada de precios inventados:
 * price null muestra "Consultar precio". */
export const products: Product[] = [
  {
    id: "powerful-40",
    name: "Powerful 3 en 1",
    presentation: "40 cápsulas",
    image: "/products/powerful-40-original.jpg",
    imagePosition: "50% 42%",
    shortDescription:
      "Presentación de mayor rendimiento para hogares, comercios y revendedores.",
    active: true,
    retailAvailable: true,
    wholesaleAvailable: true,
    price: null,
    stockStatus: "consultar",
  },
  {
    id: "powerful-20",
    name: "Powerful 3 en 1",
    presentation: "20 cápsulas",
    image: "/products/powerful-20-original.jpg",
    imagePosition: "50% 58%",
    shortDescription: "Presentación práctica para el lavado diario.",
    active: true,
    retailAvailable: true,
    wholesaleAvailable: true,
    price: null,
    stockStatus: "consultar",
  },
];
