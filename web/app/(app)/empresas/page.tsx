import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { companies } from "@/lib/companies";

export default function EmpresasPage() {
  return (
    <div style={{ padding: "26px 30px 60px" }}>
      <h1 style={{ fontSize: 20, fontWeight: 760, letterSpacing: "-.4px", margin: "0 0 4px" }}>Empresas</h1>
      <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 22px" }}>Cada empresa es un workspace independiente.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
        {companies.map((c) => (
          <Link key={c.slug} href={`/empresas/${c.slug}`} className="hoverable" style={{ background: "var(--glass)", backdropFilter: "blur(16px)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16, display: "block" }}>
            <div style={{ position: "relative", height: 110, borderRadius: 12, background: "#0e0f13", border: "1px solid var(--border)", overflow: "hidden" }}>
              <Image src={c.logo} alt={c.name} fill sizes="220px" style={{ objectFit: "contain", padding: 18 }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 13 }}>
              <div>
                <b style={{ fontSize: 13.5, fontWeight: 680, display: "block" }}>{c.name}</b>
                <span style={{ fontSize: 11, color: c.status === "desarrollo" ? "var(--warn)" : "var(--faint)" }}>{c.status === "desarrollo" ? "En desarrollo" : c.category}</span>
              </div>
              <ChevronRight size={16} style={{ marginLeft: "auto", color: "var(--faint)" }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
