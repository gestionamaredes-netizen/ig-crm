import Link from "next/link";
import { ArrowLeft, Hammer } from "lucide-react";

const titles: Record<string, string> = {
  clientes: "Clientes",
  crm: "CRM Comercial",
  ventas: "Ventas",
  marketing: "Marketing",
  finanzas: "Finanzas",
  automatizaciones: "Automatizaciones",
  documentacion: "Documentación",
  ia: "IA Asistente",
  configuracion: "Configuración",
  tareas: "Tareas",
};

export default async function SectionPlaceholder({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const title = titles[section] ?? section;
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "80vh", padding: 30 }}>
      <div style={{ textAlign: "center", maxWidth: 380 }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: "var(--grad)", display: "grid", placeItems: "center", margin: "0 auto 18px", color: "#fff" }}>
          <Hammer size={26} />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 760, letterSpacing: "-.5px", margin: "0 0 8px" }}>{title}</h1>
        <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.6, margin: "0 0 22px" }}>
          Este módulo forma parte del roadmap de IG CRM y se construye en las próximas fases. La base y el diseño ya están listos para enchufarlo.
        </p>
        <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 600 }}>
          <ArrowLeft size={15} /> Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}
