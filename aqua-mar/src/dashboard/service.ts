"use client";

import { useEffect, useState } from "react";
import { products } from "@/data/products";
import type { DashboardData } from "./types";
import { demoData } from "./demo-data";

/**
 * Proveedor de datos del panel. Hoy existen dos fuentes:
 * - empty: estado real (todavía no hay datos conectados)
 * - demo:  datos de demostración etiquetados, para previsualizar layout
 * La misma interfaz servirá para conectar Supabase / Sheets / GA4.
 */
const emptyData: DashboardData = {
  demo: false,
  stats: {
    hoy: vacio(), mes: vacio(), "30d": vacio(),
  },
  ventas: [],
  consultas: [],
  productos: products.map((p) => ({
    productId: p.id,
    name: p.name,
    presentation: p.presentation,
    consultas: null,
  })),
  cobertura: [],
  funnel: [],
  pedidos: [],
  clientes: [],
  leads: [],
  actividad: [],
};

function vacio() {
  return {
    consultas: null, pedidos: null, mayoristas: null, clientesNuevos: null,
    conversion: null, whatsapps: null, productosConsultados: null, envios: null,
  };
}

const DEMO_KEY = "aquamar_panel_demo";

export function useDashboardData(): {
  data: DashboardData;
  isDemo: boolean;
  setDemo: (v: boolean) => void;
  ready: boolean;
} {
  const [isDemo, setIsDemo] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setIsDemo(localStorage.getItem(DEMO_KEY) === "1");
    } catch {
      // sin localStorage: queda en modo real (vacío)
    }
    setReady(true);
  }, []);

  const setDemo = (v: boolean) => {
    setIsDemo(v);
    try {
      localStorage.setItem(DEMO_KEY, v ? "1" : "0");
    } catch {
      // ignorar
    }
  };

  return { data: isDemo ? demoData : emptyData, isDemo, setDemo, ready };
}
