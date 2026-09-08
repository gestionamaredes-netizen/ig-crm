"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { marcarCarga, desmarcarCarga } from "@/app/(app)/cambio/cargas-actions";
import type { Carga, OrigenCarga } from "@/lib/cambio/cargas";
import { claveCarga } from "@/lib/cambio/cargas";

export type CuentaDelRunner = {
  clave: string;
  origen: OrigenCarga;
  sourceId: string;
  titular: string;
  etiqueta: string;
};

const panel: React.CSSProperties = {
  background: "var(--glass)", backdropFilter: "blur(16px)",
  border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20,
};
const field: React.CSSProperties = {
  width: "100%", background: "var(--card)", border: "1px solid var(--border)",
  borderRadius: 10, padding: "10px 12px", fontSize: 16, color: "var(--text)", fontFamily: "inherit",
};
const label: React.CSSProperties = { fontSize: 11.5, color: "var(--muted)", display: "block", marginBottom: 5 };
const botonDorado: React.CSSProperties = {
  background: "var(--grad)", color: "#fff", border: 0, borderRadius: 11, padding: "10px 16px",
  fontSize: 13, fontWeight: 700, cursor: "pointer",
};
const botonSec: React.CSSProperties = {
  background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "8px 14px",
  fontSize: 13, fontWeight: 600, color: "var(--text)", cursor: "pointer",
};

function fmt(n: number): string {
  return n.toLocaleString("es-AR", { maximumFractionDigits: 2 });
}

export function CargasRunner({
  cuentas, cargasHoy, fecha,
}: {
  cuentas: CuentaDelRunner[];
  cargasHoy: Carga[];
  fecha: string;
}) {
  const router = useRouter();
  const [marcando, setMarcando] = useState<string | null>(null); // clave en edición
  const [pesos, setPesos] = useState("");
  const [comprados, setComprados] = useState("");
  const [recibidos, setRecibidos] = useState("");
  const [retirados, setRetirados] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const cargaDe = (clave: string): Carga | undefined =>
    cargasHoy.find((c) => claveCarga(c.origen, c.sourceId) === clave);

  const disponibles = cuentas.filter((c) => !cargaDe(c.clave));
  const usadas = cuentas.filter((c) => cargaDe(c.clave));

  const abrir = (clave: string) => {
    setMarcando(clave); setPesos(""); setComprados(""); setRecibidos(""); setRetirados(""); setError(null);
  };
  const cancelar = () => { setMarcando(null); setError(null); };

  const guardar = async (cta: CuentaDelRunner) => {
    if (ocupado) return;
    setOcupado(true); setError(null);
    try {
      const r = await marcarCarga(cta.origen, cta.sourceId, fecha, pesos, comprados, recibidos, retirados);
      if (r.ok) { setMarcando(null); router.refresh(); }
      else setError(r.error);
    } catch { setError("No se pudo conectar. Probá de nuevo."); }
    finally { setOcupado(false); }
  };

  const desmarcar = async (c: Carga) => {
    if (ocupado) return;
    if (!window.confirm("¿Desmarcar esta carga?")) return;
    setOcupado(true);
    try {
      const r = await desmarcarCarga(c.id);
      if (r.ok) router.refresh();
    } catch { /* noop */ }
    finally { setOcupado(false); }
  };

  return (
    <div style={panel}>
      <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>Cargas de hoy</h2>
      <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 14px" }}>
        Marcá cada cuenta a medida que la usás. Al otro día se reinicia.
      </p>

      <h3 style={{ fontSize: 12.5, fontWeight: 800, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 10px" }}>
        A disposición ({disponibles.length})
      </h3>
      {disponibles.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 16px" }}>No te quedan cuentas por usar hoy.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {disponibles.map((cta) => (
            <div key={cta.clave} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "11px 13px", background: "var(--card)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 650 }}>{cta.titular || "—"}</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{cta.etiqueta}</div>
                </div>
                {marcando !== cta.clave && (
                  <button type="button" onClick={() => abrir(cta.clave)} style={botonDorado}>Marcar como cargada</button>
                )}
              </div>
              {marcando === cta.clave && (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="campo-fila" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    <div><label style={label}>Pesos cargados</label><input inputMode="decimal" value={pesos} onChange={(e) => setPesos(e.target.value)} style={field} placeholder="0" /></div>
                    <div><label style={label}>Dólares comprados</label><input inputMode="decimal" value={comprados} onChange={(e) => setComprados(e.target.value)} style={field} placeholder="0" /></div>
                    <div><label style={label}>Dólares retirados</label><input inputMode="decimal" value={retirados} onChange={(e) => setRetirados(e.target.value)} style={field} placeholder="0" /></div>
                  </div>
                  {error && <p style={{ color: "var(--warn)", fontSize: 12.5, margin: 0 }}>{error}</p>}
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button type="button" onClick={cancelar} disabled={ocupado} style={botonSec}>Cancelar</button>
                    <button type="button" onClick={() => guardar(cta)} disabled={ocupado} style={{ ...botonDorado, opacity: ocupado ? 0.6 : 1 }}>
                      {ocupado ? "Guardando…" : "Guardar carga"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <h3 style={{ fontSize: 12.5, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 10px" }}>
        Cargadas hoy ({usadas.length})
      </h3>
      {usadas.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Todavía no marcaste ninguna.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {usadas.map((cta) => {
            const c = cargaDe(cta.clave)!;
            return (
              <div key={cta.clave} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "11px 13px", background: "var(--card)", opacity: 0.9 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 650 }}>✓ {cta.titular || "—"}</div>
                    <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{cta.etiqueta}</div>
                  </div>
                  <button type="button" onClick={() => desmarcar(c)} disabled={ocupado} style={{ ...botonSec, color: "var(--warn)" }}>Desmarcar</button>
                </div>
                <div style={{ marginTop: 8, fontSize: 12.5, color: "var(--muted)" }}>
                  Pesos: {fmt(c.pesosCargados)} · Comprados: USD {fmt(c.usdComprados)} · Retirados: USD {fmt(c.usdRetirados)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
