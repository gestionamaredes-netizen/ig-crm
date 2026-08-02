"use client";

import { useEffect, useState } from "react";
import { products } from "@/data/products";
import { isSupabaseConfigured } from "@/config/supabase";
import type { DashboardData } from "./types";
import { demoData } from "./demo-data";
import {
  getDashboardCache,
  loadDashboard,
  refreshDashboard,
  subscribeDashboard,
} from "./supabase-provider";

/**
 * Proveedor de datos del panel. Tres fuentes posibles:
 * - supabase: base de datos compartida del equipo (cuando está conectada)
 * - empty:    estado real sin base conectada (todavía sin datos)
 * - demo:     datos de demostración etiquetados, para previsualizar layout
 */
export type DataSource = "supabase" | "demo" | "empty";

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
  source: DataSource;
  refresh: () => Promise<void>;
  error: string | null;
} {
  const [isDemo, setIsDemo] = useState(false);
  const [ready, setReady] = useState(false);
  const [, setVersion] = useState(0);

  useEffect(() => {
    if (isSupabaseConfigured) {
      const unsubscribe = subscribeDashboard(() => {
        setVersion((v) => v + 1);
        setReady(true);
      });
      const { data } = getDashboardCache();
      if (data) setReady(true);
      loadDashboard();
      return unsubscribe;
    }
    try {
      setIsDemo(localStorage.getItem(DEMO_KEY) === "1");
    } catch {
      // sin localStorage: queda en modo real (vacío)
    }
    setReady(true);
  }, []);

  const setDemo = (v: boolean) => {
    if (isSupabaseConfigured) return; // con base conectada no hay modo demo
    setIsDemo(v);
    try {
      localStorage.setItem(DEMO_KEY, v ? "1" : "0");
    } catch {
      // ignorar
    }
  };

  if (isSupabaseConfigured) {
    const { data, error } = getDashboardCache();
    return {
      data: data ?? emptyData,
      isDemo: false,
      setDemo,
      ready,
      source: "supabase",
      refresh: refreshDashboard,
      error,
    };
  }

  return {
    data: isDemo ? demoData : emptyData,
    isDemo,
    setDemo,
    ready,
    source: isDemo ? "demo" : "empty",
    refresh: () => Promise.resolve(),
    error: null,
  };
}
