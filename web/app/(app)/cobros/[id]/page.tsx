import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCliente } from "@/lib/cobros/datos";
import { formatearPesos } from "@/lib/formato";
import { BotonNuevoCobro, BotonAgregarCosto, BotonAgregarPago } from "@/components/cobros/cobro-forms";
import { BotonBorrar } from "@/components/cobros/ui";
import { borrarCobro, borrarCosto, borrarPago } from "@/app/(app)/cobros/actions";

export const dynamic = "force-dynamic";

const panel: React.CSSProperties = {
  background: "var(--glass)",
  backdropFilter: "blur(16px)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: 20,
};
const dato: React.CSSProperties = { fontSize: 11, color: "var(--muted)" };
const valor: React.CSSProperties = { fontSize: 18, fontWeight: 760, display: "block", marginTop: 4 };

export default async function ClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cl = await getCliente(id);
  if (!cl) notFound();

  const r = cl.resumen;

  return (
    <div style={{ padding: "26px 30px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <Link href="/cobros" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "var(--muted)", marginBottom: 10 }}>
            <ArrowLeft size={15} /> Volver a Cobros
          </Link>
          <h1 style={{ fontSize: 21, fontWeight: 780, letterSpacing: "-.5px", margin: 0 }}>{cl.nombre}</h1>
          <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "5px 0 0" }}>{cl.tipo === "mensual" ? "Cliente mensual" : "Trabajo único"}</p>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <BotonNuevoCobro clienteId={cl.id} />
        </div>
      </div>

      {/* Resumen total del cliente */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 14 }}>
        {[
          { l: "Facturado", v: formatearPesos(r.total) },
          { l: "Costos", v: formatearPesos(r.costos) },
          { l: "Ganancia", v: formatearPesos(r.ganancia) },
          { l: "Marcelo (30%)", v: formatearPesos(r.marcelo) },
          { l: "Fabricio (70%)", v: formatearPesos(r.fabricio) },
          { l: "Saldo", v: r.saldo <= 0 ? "Al día" : formatearPesos(r.saldo) },
        ].map((k) => (
          <div key={k.l} style={{ ...panel, padding: "14px 16px" }}>
            <div style={dato}>{k.l}</div>
            <b className="tnum" style={valor}>{k.v}</b>
          </div>
        ))}
      </div>

      {cl.cobros.length === 0 ? (
        <div style={{ ...panel, textAlign: "center", color: "var(--faint)", fontSize: 13, padding: "36px 0" }}>
          Todavía no hay cobros. Tocá &quot;Nuevo cobro&quot;.
        </div>
      ) : (
        cl.cobros.map((c) => (
          <div key={c.id} style={panel}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <b style={{ fontSize: 15, fontWeight: 700, display: "block" }}>{c.concepto || "Cobro"}</b>
                <span style={{ fontSize: 11.5, color: "var(--faint)" }}>{c.fecha} · Facturado {formatearPesos(c.total)}</span>
              </div>
              <BotonBorrar accion={borrarCobro} campos={{ id: c.id, clienteId: cl.id }} confirmar={`¿Borrar el cobro "${c.concepto || "sin concepto"}" y todos sus costos y pagos?`}>
                Borrar cobro
              </BotonBorrar>
            </div>

            {/* Reparto calculado */}
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", padding: "12px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
              {[
                { l: "Ganancia", v: formatearPesos(c.resumen.ganancia) },
                { l: "Marcelo 30%", v: formatearPesos(c.resumen.marcelo) },
                { l: "Fabricio 70%", v: formatearPesos(c.resumen.fabricio) },
                { l: "Pagado", v: formatearPesos(c.resumen.pagado) },
                { l: "Saldo", v: c.resumen.saldo <= 0 ? "Al día" : formatearPesos(c.resumen.saldo) },
              ].map((k) => (
                <div key={k.l}>
                  <div style={dato}>{k.l}</div>
                  <b className="tnum" style={{ fontSize: 14, fontWeight: 720 }}>{k.v}</b>
                </div>
              ))}
            </div>

            {/* Costos */}
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".6px", textTransform: "uppercase", color: "var(--faint)" }}>Costos de producción</span>
                <BotonAgregarCosto cobroId={c.id} clienteId={cl.id} />
              </div>
              {c.costos.length === 0 ? (
                <span style={{ fontSize: 12, color: "var(--faint)" }}>Sin costos — la ganancia es el total.</span>
              ) : (
                c.costos.map((x) => (
                  <div key={x.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", fontSize: 12.5 }}>
                    <span style={{ flex: 1, minWidth: 0 }}>{x.concepto}</span>
                    <b className="tnum">{formatearPesos(x.monto)}</b>
                    <BotonBorrar accion={borrarCosto} campos={{ id: x.id, clienteId: cl.id }} confirmar={`¿Borrar el costo "${x.concepto}"?`}>✕</BotonBorrar>
                  </div>
                ))
              )}
            </div>

            {/* Pagos */}
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".6px", textTransform: "uppercase", color: "var(--faint)" }}>Pagos</span>
                <BotonAgregarPago cobroId={c.id} clienteId={cl.id} />
              </div>
              {c.pagos.length === 0 ? (
                <span style={{ fontSize: 12, color: "var(--faint)" }}>Sin pagos registrados.</span>
              ) : (
                c.pagos.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", fontSize: 12.5 }}>
                    <span style={{ flex: 1, minWidth: 0, color: "var(--muted)" }}>
                      {p.fecha}
                      {p.medio ? ` · ${p.medio}` : ""}
                      {p.cuenta ? ` · ${p.cuenta}` : ""}
                    </span>
                    <b className="tnum">{formatearPesos(p.monto)}</b>
                    <BotonBorrar accion={borrarPago} campos={{ id: p.id, clienteId: cl.id }} confirmar="¿Borrar este pago?">✕</BotonBorrar>
                  </div>
                ))
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
