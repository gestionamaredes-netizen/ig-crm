import { Sidebar } from "@/components/shell/sidebar";
import { AmbientGlow } from "@/components/shell/ambient-glow";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="ig-shell"
      style={{
        display: "grid",
        gridTemplateColumns: "232px 1fr",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <AmbientGlow />
      <Sidebar />
      <div style={{ position: "relative", zIndex: 1, minWidth: 0, height: "100vh", overflowY: "auto" }}>{children}</div>
    </div>
  );
}
