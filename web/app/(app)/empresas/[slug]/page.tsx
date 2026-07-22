import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompany, companies } from "@/lib/companies";
import { getLeadsBySlug, getStageOptions, getKpisEmpresa } from "@/lib/data";
import { FunnelBoard } from "@/components/workspace/funnel-board";
import { NewLeadButton } from "@/components/workspace/new-lead-form";
import { getCampanasDeEmpresa } from "@/lib/pautas/datos";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return companies.map((c) => ({ slug: c.slug }));
}

export default async function WorkspacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCompany(slug);
  if (!c) notFound();
  const [leads, stages, campanas, kpis] = await Promise.all([
    getLeadsBySlug(slug),
    getStageOptions(slug),
    getCampanasDeEmpresa(slug),
    getKpisEmpresa(slug),
  ]);
  const pill =
    c.status === "activo"
      ? { background: "rgba(74,222,128,.13)", color: "var(--ok)" }
      : { background: "rgba(245,177,60,.14)", color: "var(--warn)" };

  return (
    <div style={{ ["--accent" as string]: c.color }}>
      <div style={{ position: "sticky", top: 0, zIndex: 6, display: "flex", alignItems: "center", gap: 14, padding: "18px 30px", background: "linear-gradient(180deg,rgba(11,11,13,.9),rgba(11,11,13,.5))", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: 13, color: "var(--faint)", display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/dashboard" style={{ color: "var(--accent)" }}>Dashboard</Link> ›{" "}
          <b style={{ color: "var(--text)", fontWeight: 650 }}>{c.name}</b>
        </div>
      </div>

      <div style={{ padding: "24px 30px 60px", display: "flex", flexDirection: "column", gap: 22 }}>
        {/* Hero */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, background: "var(--glass)", backdropFilter: "blur(16px)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "18px 20px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: c.grad }} />
          <div style={{ position: "relative", width: 58, height: 58, borderRadius: 14, background: "#0e0f13", border: "1px solid var(--border)", overflow: "hidden", flex: "none" }}>
            <Image src={c.logo} alt={c.name} fill sizes="58px" style={{ objectFit: "contain", padding: 7 }} />
          </div>
          <div>
            <span style={{ fontSize: 20, fontWeight: 750, letterSpacing: "-.4px", display: "block" }}>{c.name}</span>
            <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{c.category}</span>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "4px 9px", borderRadius: 20, ...pill }}>{c.statusLabel}</span>
        </div>

        {/* Módulos */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
          {c.modules.map((m, i) => (
            <button key={m} style={{ whiteSpace: "nowrap", padding: "8px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 550, color: i === 0 ? "#fff" : "var(--muted)", border: i === 0 ? "1px solid transparent" : "1px solid var(--border)", background: i === 0 ? c.grad : "var(--card)", cursor: "pointer" }}>
              {m}
            </button>
          ))}
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {kpis.map(([v, l]) => (
            <div key={l} style={{ background: "var(--glass)", backdropFilter: "blur(16px)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 18 }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{l}</div>
              <div className="tnum" style={{ fontSize: 26, fontWeight: 780, letterSpacing: "-.8px", marginTop: 10, color: c.color }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Embudo */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 15 }}>
            <h2 style={{ fontSize: 15, fontWeight: 720, margin: 0 }}>CRM Comercial — Embudo</h2>
            <NewLeadButton
              slug={c.slug}
              stages={stages}
              accent={c.color}
              campanas={campanas.map((k) => ({ id: k.id, name: k.nombre }))}
            />
          </div>
          <FunnelBoard leads={leads} />
        </div>
      </div>
    </div>
  );
}
