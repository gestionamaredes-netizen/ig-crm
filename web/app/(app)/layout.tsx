import { Sidebar } from "@/components/shell/sidebar";
import { AmbientGlow } from "@/components/shell/ambient-glow";
import { createClient } from "@/lib/supabase/server";
import { accessTier, authEnabled, type AccessTier } from "@/lib/auth-config";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Con login apagado (dev local) no hay usuario: se trata como acceso completo
  // para no vaciar el menú mientras se trabaja sin sesión.
  let tier: AccessTier = "full";
  if (authEnabled()) {
    const sb = await createClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    tier = accessTier(user?.email);
  }

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
      <Sidebar tier={tier} />
      <div style={{ position: "relative", zIndex: 1, minWidth: 0, height: "100vh", overflowY: "auto" }}>{children}</div>
    </div>
  );
}
