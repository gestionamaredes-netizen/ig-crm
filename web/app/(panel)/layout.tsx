import { AmbientGlow } from "@/components/shell/ambient-glow";

// Layout de la "app reducida" del runner: SIN el Sidebar del CRM. El runner
// solo tiene su panel, así que no hay navegación lateral que mostrar. El
// candado de rutas lo pone el middleware (proxy.ts) + canAccessPath("runner").
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <AmbientGlow />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
