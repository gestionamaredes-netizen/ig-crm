import { formatearPesos } from "@/lib/formato";
import type { FilaGasto } from "@/lib/finanzas/datos";

const tonos: Record<string, { bg: string; c: string }> = {
  rojo: { bg: "rgba(255,107,107,.15)", c: "#ff8585" },
  ambar: { bg: "rgba(245,177,60,.15)", c: "#f5b13c" },
  gris: { bg: "rgba(255,255,255,.07)", c: "var(--faint)" },
};

export function ProximosVencimientos({ filas }: { filas: FilaGasto[] }) {
  // Sin nada cerca de vencer el bloque no se renderiza: un panel vacío ocupa
  // el mismo espacio que uno lleno y no dice nada.
  if (filas.length === 0) return null;

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
      <b style={{ fontSize: 13.5, fontWeight: 700 }}>Próximos vencimientos</b>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 12 }}>
        {filas.map((f) => (
          <div
            key={f.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 0",
              borderTop: "1px solid var(--border)",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: 3, background: f.empresaColor, flex: "none" }} />
            <div style={{ minWidth: 0 }}>
              <b style={{ fontSize: 13, fontWeight: 640, display: "block" }}>{f.concepto}</b>
              <span style={{ fontSize: 11, color: "var(--faint)" }}>
                {f.empresa}
                {f.proveedor && ` · ${f.proveedor}`} · {f.renuevaEl}
              </span>
            </div>
            <span
              style={{
                marginLeft: "auto",
                fontSize: 10.5,
                fontWeight: 700,
                padding: "3px 9px",
                borderRadius: 20,
                whiteSpace: "nowrap",
                ...tonos[f.vencimiento!.tono],
              }}
            >
              {f.vencimiento!.etiqueta}
            </span>
            <b className="tnum" style={{ fontSize: 13, fontWeight: 700, minWidth: 88, textAlign: "right" }}>
              {formatearPesos(f.monto)}
            </b>
          </div>
        ))}
      </div>
    </div>
  );
}
