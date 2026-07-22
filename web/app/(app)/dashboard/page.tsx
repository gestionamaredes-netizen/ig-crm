import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Bell,
  MessageSquare,
  Calendar,
  Users,
  DollarSign,
  BarChart3,
  Target,
  CheckCircle2,
  ChevronRight,
  Plus,
} from "lucide-react";
import { companies } from "@/lib/companies";
import { integrations } from "@/lib/dashboard-data";
import { getFunnelSummary, getTasks, getResumenGeneral, getActivity } from "@/lib/data";
import { formatearPesos } from "@/lib/formato";
import { FunnelPyramid } from "@/components/dashboard/funnel-pyramid";
import { PautasCard } from "@/components/dashboard/pautas-card";
import { getResumenPautas } from "@/lib/pautas/datos";
import { IgAiPanel } from "@/components/shell/ig-ai-panel";

export const dynamic = "force-dynamic";

const icons = { users: Users, dollar: DollarSign, chart: BarChart3, target: Target, check: CheckCircle2 };
const panel: React.CSSProperties = {
  background: "var(--glass)",
  backdropFilter: "blur(16px)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: 20,
};
const secTitle: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: "var(--muted)" };
const priColors: Record<string, { bg: string; c: string }> = {
  Alta: { bg: "rgba(255,107,107,.15)", c: "#ff8585" },
  Media: { bg: "rgba(245,177,60,.15)", c: "#f5b13c" },
  Baja: { bg: "rgba(90,157,255,.15)", c: "#5b9dff" },
};

export default async function DashboardPage() {
  const [funnelData, tasks, resumenPautas, general, actividad] = await Promise.all([
    getFunnelSummary(),
    getTasks(),
    getResumenPautas(),
    getResumenGeneral(),
    getActivity(),
  ]);

  // Cifras reales de la base. Antes eran números de demostración hardcodeados.
  const bigStats = [
    { label: "Clientes", value: String(general.clientes), pie: "en etapa Cliente", icon: "users", color: "#7d7bf0" },
    { label: "Ventas", value: formatearPesos(general.ventas), pie: "cerrado en clientes", icon: "dollar", color: "#5b9dff" },
    { label: "Leads", value: String(general.leads), pie: "en el embudo", icon: "chart", color: "#FF6B6B" },
    {
      label: "Conversión",
      value: general.conversion === null ? "—" : `${(general.conversion * 100).toFixed(1)}%`,
      pie: "leads que cerraron",
      icon: "target",
      color: "#FF9966",
    },
    { label: "Tareas", value: String(general.tareas), pie: "pendientes", icon: "check", color: "#2dd4bf" },
  ];
  return (
    <>
      {/* Topbar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 6,
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "18px 30px",
          background: "linear-gradient(180deg,rgba(11,11,13,.9),rgba(11,11,13,.5))",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Bienvenido de vuelta,</div>
          <h1 style={{ fontSize: 22, fontWeight: 780, letterSpacing: "-.5px", margin: "1px 0 0" }}>Fabricio.</h1>
        </div>
        <div
          className="ig-topsearch"
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 9,
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "10px 14px",
            width: 300,
            color: "var(--faint)",
            fontSize: 13,
          }}
        >
          <Search size={15} /> Buscar en IG CRM…
        </div>
        <button style={iconBtn} aria-label="Notificaciones"><Bell size={17} /></button>
        <button style={iconBtn} aria-label="Mensajes"><MessageSquare size={17} /></button>
        <div style={{ ...iconBtn, width: "auto", padding: "0 14px", gap: 8, fontSize: 12.5, color: "var(--muted)" }}>
          <Calendar size={15} /> Lunes, 13 de Julio 2026
        </div>
      </div>

      {/* Content */}
      <div className="ig-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, padding: "24px 30px 40px", alignItems: "start" }}>
        {/* MAIN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22, minWidth: 0 }}>
          {/* Stat cards */}
          <div className="ig-bigs" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14 }}>
            {bigStats.map((s) => {
              const Icon = icons[s.icon as keyof typeof icons];
              return (
                <div key={s.label} className="hoverable" style={{ ...panel, padding: "16px 16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>{s.label}</span>
                    <span style={{ width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center", background: `${s.color}22`, color: s.color }}>
                      <Icon size={17} />
                    </span>
                  </div>
                  <div className="tnum" style={{ fontSize: 25, fontWeight: 780, letterSpacing: "-.8px", marginTop: 12 }}>{s.value}</div>
                  <div style={{ fontSize: 11.5, marginTop: 5, color: "var(--faint)" }}>{s.pie}</div>
                </div>
              );
            })}
          </div>

          {/* MIS EMPRESAS */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={secTitle}>Mis empresas</span>
              <Link href="/empresas" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>Ver todas</Link>
            </div>
            <div className="ig-comps" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(158px,1fr))", gap: 14 }}>
              {companies.map((c) => (
                <Link key={c.slug} href={`/empresas/${c.slug}`} className="hoverable" style={{ ...panel, padding: 14, display: "block" }}>
                  <div style={{ position: "relative", height: 96, borderRadius: 11, background: "#0e0f13", border: "1px solid var(--border)", display: "grid", placeItems: "center", overflow: "hidden" }}>
                    <Image src={c.logo} alt={c.name} fill sizes="180px" style={{ objectFit: "contain", padding: 16 }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <b style={{ fontSize: 13, fontWeight: 680, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</b>
                      <span style={{ fontSize: 11, color: c.status === "desarrollo" ? "var(--warn)" : "var(--faint)" }}>
                        {c.status === "desarrollo" ? "En desarrollo" : c.category}
                      </span>
                    </div>
                    <ChevronRight size={15} style={{ marginLeft: "auto", color: "var(--faint)", flex: "none" }} />
                  </div>
                </Link>
              ))}
              <button style={{ ...panel, padding: 14, border: "1px dashed var(--border-2)", background: "transparent", color: "var(--faint)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 9, minHeight: 150 }}>
                <span style={{ width: 40, height: 40, borderRadius: 12, border: "1px solid var(--border-2)", display: "grid", placeItems: "center" }}><Plus size={20} /></span>
                <span style={{ fontSize: 12.5 }}>Nueva empresa</span>
              </button>
            </div>
          </div>

          {/* Trio: embudo, financiero, tareas */}
          <div className="ig-trio" style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr .9fr", gap: 16 }}>
            <div style={panel}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={secTitle}>Embudo comercial</span>
              </div>
              <FunnelPyramid data={funnelData} />
              <Link href="/crm" style={{ display: "block", textAlign: "center", marginTop: 16, padding: "9px 0", borderRadius: 10, border: "1px solid var(--border)", fontSize: 12, color: "var(--muted)" }}>Ver embudo completo</Link>
            </div>

            <div style={panel}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={secTitle}>Resumen financiero</span>
              </div>
              {/* Sin módulo de finanzas todavía: lo único con respaldo real es lo
                  cerrado en el embudo y lo invertido en pautas. */}
              <div style={{ display: "flex", gap: 22, flexWrap: "wrap", paddingTop: 6 }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--faint)" }}>Vendido</div>
                  <b className="tnum" style={{ fontSize: 19, fontWeight: 750 }}>{formatearPesos(general.ventas)}</b>
                  <div style={{ fontSize: 11, color: "var(--faint)" }}>leads en etapa Cliente</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--faint)" }}>Invertido en pautas</div>
                  <b className="tnum" style={{ fontSize: 19, fontWeight: 750 }}>{formatearPesos(resumenPautas.inversion)}</b>
                  <div style={{ fontSize: 11, color: "var(--faint)" }}>este mes</div>
                </div>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)", lineHeight: 1.5 }}>
                El módulo de Finanzas todavía no está construido. Cuando lo esté, acá van ingresos y
                costos reales.
              </div>
            </div>

            <div style={panel}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={secTitle}>Tareas pendientes</span>
                <Link href="/tareas" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>Ver todas</Link>
              </div>
              <div>
                {tasks.map((t, i) => {
                  const pri = priColors[t.priority];
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: i < tasks.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <span style={{ width: 17, height: 17, borderRadius: 6, border: "1.6px solid var(--faint)", flex: "none", marginTop: 1 }} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <b style={{ fontSize: 12.5, fontWeight: 550, display: "block" }}>{t.title}</b>
                        <span style={{ fontSize: 11, color: "var(--faint)" }}>{t.company}</span>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: pri.bg, color: pri.c, flex: "none" }}>{t.priority}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <PautasCard resumen={resumenPautas} />

          {/* Integraciones */}
          <div style={panel}>
            <div style={{ marginBottom: 14 }}><span style={secTitle}>Integraciones activas</span></div>
            <div className="ig-integrations" style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 12 }}>
              {integrations.map((n) => (
                <div key={n.name} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "11px 12px" }}>
                  <span style={{ width: 30, height: 30, borderRadius: 9, background: `${n.color}22`, color: n.color, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800, flex: "none" }}>{n.name.charAt(0)}</span>
                  <div style={{ minWidth: 0 }}>
                    <b style={{ fontSize: 11.5, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.name}</b>
                    <span style={{ fontSize: 10, color: "var(--ok)" }}>Conectado</span>
                  </div>
                </div>
              ))}
              <button style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "transparent", border: "1px dashed var(--border-2)", borderRadius: 12, padding: "11px 12px", color: "var(--faint)", fontSize: 11.5, cursor: "pointer" }}>
                <Plus size={15} /> Agregar
              </button>
            </div>
          </div>

          <div style={{ textAlign: "center", fontSize: 11.5, color: "var(--faint)", paddingTop: 6 }}>
            IG CRM · Desarrollado por Iniciativa Global · Todos los derechos reservados.
          </div>
        </div>

        {/* RIGHT RAIL */}
        <div className="ig-rail" style={{ display: "flex", flexDirection: "column", gap: 18, position: "sticky", top: 92 }}>
          <IgAiPanel />
          <div style={panel}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={secTitle}>Actividad reciente</span>
              <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>Ver todas</span>
            </div>
            <div>
              {actividad.length === 0 ? (
                <div style={{ fontSize: 12, color: "var(--faint)", padding: "16px 0", lineHeight: 1.5 }}>
                  Todavía no hay actividad registrada. Va a aparecer sola a medida que cargues leads,
                  tareas y ventas.
                </div>
              ) : (
                actividad.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 0", borderBottom: i < actividad.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <span style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(125,123,240,.13)", color: "#7d7bf0", display: "grid", placeItems: "center", fontSize: 10.5, fontWeight: 800, flex: "none" }}>
                      {(a.company || "··").slice(0, 2).toUpperCase()}
                    </span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <b style={{ fontSize: 12, fontWeight: 560, display: "block", lineHeight: 1.3 }}>{a.text}</b>
                      <span style={{ fontSize: 11, color: "var(--faint)" }}>{a.company}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const iconBtn: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 11,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--muted)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};
