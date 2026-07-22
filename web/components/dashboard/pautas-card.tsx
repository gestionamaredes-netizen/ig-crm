import Link from "next/link";
import { formatearPesos } from "@/lib/pautas/metricas";
import type { ResumenPautas } from "@/lib/pautas/datos";

const W = 260;
const H = 44;

function sparkline(serie: number[]): string {
  const max = Math.max(...serie, 1);
  const step = W / Math.max(1, serie.length - 1);
  return serie
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(H - (v / max) * H).toFixed(1)}`)
    .join(" ");
}

export function PautasCard({ resumen }: { resumen: ResumenPautas }) {
  const sinDatos = resumen.inversion === 0 && resumen.leads === 0;

  return (
    <div
      style={{
        background: "var(--glass)",
        backdropFilter: "blur(16px)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: "var(--muted)" }}>
          Pautas
        </span>
        <Link href="/marketing" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
          Ver todas
        </Link>
      </div>

      {sinDatos ? (
        <EstadoVacio resumen={resumen} />
      ) : (
        <>
          <div style={{ display: "flex", gap: 26, flexWrap: "wrap" }}>
            <Dato titulo="Inversión del mes" valor={formatearPesos(resumen.inversion)} />
            <Dato titulo="Leads" valor={String(resumen.leads)} />
            <Dato
              titulo="Costo por lead"
              valor={resumen.costoPorLead === null ? "—" : formatearPesos(resumen.costoPorLead)}
            />
          </div>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            style={{ width: "100%", height: H, display: "block", marginTop: 16 }}
          >
            <path
              d={sparkline(resumen.serie)}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div style={{ fontSize: 10.5, color: "var(--faint)", marginTop: 4 }}>Gasto de los últimos 30 días</div>
        </>
      )}
    </div>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--faint)" }}>{titulo}</div>
      <b className="tnum" style={{ fontSize: 19, fontWeight: 750 }}>
        {valor}
      </b>
    </div>
  );
}

/** Sin datos no mostramos $0: eso parecería una campaña fracasada en vez de una que todavía no salió. */
function EstadoVacio({ resumen }: { resumen: ResumenPautas }) {
  const texto =
    resumen.campanasActivas > 0
      ? `${resumen.campanasActivas} campaña${resumen.campanasActivas > 1 ? "s" : ""} activa${resumen.campanasActivas > 1 ? "s" : ""} · sin datos cargados`
      : resumen.campanasEnBorrador > 0
        ? `${resumen.campanasEnBorrador} campaña${resumen.campanasEnBorrador > 1 ? "s" : ""} en borrador`
        : "Todavía no cargaste ninguna campaña";

  return (
    <div style={{ padding: "18px 0 8px" }}>
      <b style={{ fontSize: 14, fontWeight: 650, display: "block" }}>{texto}</b>
      <span style={{ fontSize: 12, color: "var(--faint)", display: "block", marginTop: 5 }}>
        {resumen.campanaDestacada ?? "Creá una campaña para empezar a medir"}
      </span>
    </div>
  );
}
