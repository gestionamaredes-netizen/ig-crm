"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { companies } from "@/lib/companies";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Building2,
  Users,
  GitBranch,
  TrendingUp,
  Megaphone,
  Radio,
  Wallet,
  Zap,
  FileText,
  Sparkles,
  Settings,
  LogOut,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/empresas", label: "Empresas", icon: Building2 },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/crm", label: "CRM Comercial", icon: GitBranch },
  { href: "/ventas", label: "Ventas", icon: TrendingUp },
  { href: "/marketing", label: "Marketing", icon: Megaphone },
  { href: "/transmisiones", label: "Transmisiones", icon: Radio },
  { href: "/finanzas", label: "Finanzas", icon: Wallet },
  { href: "/automatizaciones", label: "Automatizaciones", icon: Zap },
  { href: "/documentacion", label: "Documentación", icon: FileText },
  { href: "/ia", label: "IA Asistente", icon: Sparkles, badge: "Nuevo" },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

export function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const logout = async () => {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  };
  const active = (href: string) =>
    href === "/dashboard" ? path === href : path === href || path.startsWith(href + "/");

  return (
    <aside
      className="ig-side"
      style={{
        borderRight: "1px solid var(--border)",
        background: "rgba(13,13,15,.55)",
        backdropFilter: "blur(20px)",
        padding: "22px 14px",
        position: "sticky",
        top: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        zIndex: 2,
        overflowY: "auto",
      }}
    >
      <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 10px 18px" }}>
        <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-2px", lineHeight: 1 }}>
          i<span className="gt">G</span>
        </span>
        <span>
          <b style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", display: "block", color: "var(--text)" }}>
            INICIATIVA
          </b>
          <b style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", display: "block", color: "var(--muted)" }}>
            GLOBAL
          </b>
        </span>
        <span
          style={{
            marginLeft: 2,
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "1px",
            padding: "2px 6px",
            borderRadius: 6,
            background: "var(--grad)",
            color: "#fff",
            alignSelf: "flex-start",
          }}
        >
          CRM
        </span>
      </Link>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {nav.map((n) => {
          const Icon = n.icon;
          return (
            <Link key={n.href} href={n.href} className="nav-row" data-active={active(n.href)}>
              <Icon size={17} style={{ opacity: 0.85, flex: "none" }} />
              {n.label}
              {n.badge && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 9.5,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 20,
                    background: "rgba(125,123,240,.2)",
                    color: "var(--accent)",
                  }}
                >
                  {n.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div style={{ margin: "14px 4px 6px", fontSize: 9.5, letterSpacing: "1.4px", textTransform: "uppercase", color: "var(--faint)" }}>
        Empresas
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {companies.map((c) => {
          const href = `/empresas/${c.slug}`;
          return (
            <Link key={c.slug} href={href} className="nav-row" data-active={active(href)}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: c.color, flex: "none" }} />
              {c.name}
            </Link>
          );
        })}
      </nav>

      <div
        style={{
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 8px 4px",
          borderTop: "1px solid var(--border)",
        }}
      >
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "var(--grad)",
            display: "grid",
            placeItems: "center",
            fontSize: 13,
            fontWeight: 750,
            color: "#fff",
            flex: "none",
          }}
        >
          F
        </span>
        <span style={{ minWidth: 0 }}>
          <b style={{ fontSize: 12.5, display: "block" }}>Fabricio Ortega</b>
          <span style={{ fontSize: 11, color: "var(--faint)" }}>Administrador</span>
        </span>
        <button
          onClick={logout}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--faint)", cursor: "pointer", padding: 6, borderRadius: 8, display: "grid", placeItems: "center" }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
