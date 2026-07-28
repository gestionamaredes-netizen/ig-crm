import Link from "next/link";
import { getClientes } from "@/lib/cobros/datos";
import { formatearPesos } from "@/lib/formato";
import { BotonNuevoCliente } from "@/components/cobros/nuevo-cliente";

export const dynamic = "force-dynamic";

const panel: React.CSSProperties = {
  background: "var(--glass)",
  backdropFilter: "blur(16px)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: 20,
};
const th: React.CSSProperties = { textAlign: "right", fontSize: 10.5, fontWeight: 700, letterSpacing: ".6px", textTransform: "uppercase", color: "var(--faint)", padding: "0 0 10px" };
const td: React.CSSProperties = { textAlign: "right", fontSize: 12.5, padding: "13px 0", borderTop: "1px solid var(--border)" };

export default async function CobrosPage() {
  const clientes = await getClientes();
  const tot = clientes.reduce(
    (a, c) => ({ facturado: a.facturado + c.resumen.total, ganancia: a.ganancia + c.resumen.ganancia, saldo: a.saldo + c.resumen.saldo }),
    { facturado: 0, ganancia: 0, saldo: 0 },
  );

  const kpis = [
    { label: "Facturado", valor: formatearPesos(tot.facturado) },
    { label: "Ganancia", valor: formatearPesos(tot.ganancia) },
    { label: "Por cobrar", valor: formatearPesos(tot.saldo) },
    { label: "Clientes", valor: String(clientes.length) },
  ];

  return (
    <div style={{ padding: "26px 30px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 780, letterSpacing: "-.5px", margin: 0 }}>Cobros</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "5px 0 0" }}>Clientes de la agencia: facturación, reparto y saldos.</p>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <BotonNuevoCliente />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ ...panel, padding: "16px 18px" }}>
            <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{k.label}</div>
            <b className="tnum" style={{ fontSize: 23, fontWeight: 780, letterSpacing: "-.6px", display: "block", marginTop: 8 }}>{k.valor}</b>
          </div>
        ))}
      </div>

      <div style={panel}>
        {clientes.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--faint)", fontSize: 13 }}>
            Todavía no hay clientes. Tocá &quot;Nuevo cliente&quot; para empezar.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
              <thead>
                <tr>
                  <th style={{ ...th, textAlign: "left" }}>Cliente</th>
                  <th style={th}>Facturado</th>
                  <th style={th}>Ganancia</th>
                  <th style={th}>Pagado</th>
                  <th style={th}>Saldo</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id}>
                    <td style={{ ...td, textAlign: "left" }}>
                      <Link href={`/cobros/${c.id}`} style={{ display: "block" }}>
                        <b style={{ fontSize: 13, fontWeight: 640 }}>{c.nombre}</b>
                        <span style={{ fontSize: 11, color: "var(--faint)", display: "block" }}>
                          {c.tipo === "mensual" ? "Mensual" : "Trabajo único"} · {c.cantidadCobros} {c.cantidadCobros === 1 ? "cobro" : "cobros"}
                        </span>
                      </Link>
                    </td>
                    <td style={td}>{formatearPesos(c.resumen.total)}</td>
                    <td style={td}>{formatearPesos(c.resumen.ganancia)}</td>
                    <td style={td}>{formatearPesos(c.resumen.pagado)}</td>
                    <td style={{ ...td, fontWeight: 700, color: c.resumen.saldo > 0 ? "var(--warn)" : "var(--ok)" }}>
                      {c.resumen.saldo <= 0 ? "Al día" : formatearPesos(c.resumen.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
