"use client";
import { useEffect, useState } from "react";
import { formatearPesos } from "@/lib/formato";

// Los stocks y saldos son ACUMULATIVOS (el inventario que se arrastra). Para
// que al arrancar un día el tablero se vea limpio ("en cero"), esta sección
// arranca OCULTA y se muestra solo si el usuario la abre. La preferencia se
// recuerda en el navegador, así que si a alguien le gusta verla siempre, queda
// abierta la próxima vez.
const CLAVE = "cambio_ver_acumulado";

const panel: React.CSSProperties = {
  background: "var(--glass)",
  backdropFilter: "blur(16px)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: 20,
};

type Kpi = { label: string; valor: string };
type CajaSaldo = { id: string; nombre: string; moneda: string; saldo: number };

export function ResumenAcumulado({ kpis, cajas }: { kpis: Kpi[]; cajas: CajaSaldo[] }) {
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    // localStorage no existe en el servidor: se lee recién después del montaje.
    // El server y el primer render del cliente coinciden en `false` (sin
    // mismatch de hidratación) y acá se aplica la preferencia guardada.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAbierto(localStorage.getItem(CLAVE) === "1");
  }, []);

  const toggle = () => {
    setAbierto((v) => {
      const nuevo = !v;
      try {
        localStorage.setItem(CLAVE, nuevo ? "1" : "0");
      } catch {
        // Modo privado o storage lleno: no rompe, solo no recuerda la preferencia.
      }
      return nuevo;
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <button
        type="button"
        onClick={toggle}
        style={{
          alignSelf: "flex-start",
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 11,
          padding: "9px 15px",
          fontSize: 13,
          fontWeight: 600,
          color: abierto ? "var(--text)" : "var(--accent)",
          cursor: "pointer",
        }}
      >
        {abierto ? "▾ Ocultar stock y saldos" : "▸ Ver stock y saldos"}
      </button>

      {abierto && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
            {kpis.map((k) => (
              <div key={k.label} style={{ ...panel, padding: "16px 18px" }}>
                <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{k.label}</div>
                <b className="tnum" style={{ fontSize: 23, fontWeight: 780, letterSpacing: "-.6px", display: "block", marginTop: 8 }}>
                  {k.valor}
                </b>
              </div>
            ))}
          </div>

          <div style={panel}>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px" }}>Cajas</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
              {cajas.map((s) => (
                <div key={s.id}>
                  <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{s.nombre}</div>
                  {/* Caja en descubierto = falta cargar una operación o hay plata mal imputada. Se marca en vez de disimularse. */}
                  <b
                    className="tnum"
                    style={{ fontSize: 16, display: "block", marginTop: 4, color: s.saldo < 0 ? "var(--warn)" : undefined }}
                  >
                    {s.moneda === "ARS"
                      ? formatearPesos(s.saldo)
                      : `USD ${s.saldo.toLocaleString("es-AR", { maximumFractionDigits: 2 })}`}
                  </b>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
