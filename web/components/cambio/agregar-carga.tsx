"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { marcarCarga } from "@/app/(app)/cambio/cargas-actions";
import type { OrigenCarga } from "@/lib/cambio/cargas";

// Cuenta elegible para cargarle un movimiento a mano (admin). Solo datos
// serializables: la etiqueta ya viene armada desde el server.
export type CuentaParaCargar = { clave: string; origen: OrigenCarga; sourceId: string; label: string };

const field: React.CSSProperties = {
  width: "100%", background: "var(--card)", border: "1px solid var(--border)",
  borderRadius: 10, padding: "10px 12px", fontSize: 16, color: "var(--text)", fontFamily: "inherit",
};
const label: React.CSSProperties = { fontSize: 11.5, color: "var(--muted)", display: "block", marginBottom: 5 };
const botonDorado: React.CSSProperties = {
  background: "var(--grad)", color: "#fff", border: 0, borderRadius: 11, padding: "10px 18px",
  fontSize: 13, fontWeight: 700, cursor: "pointer",
};
const botonSec: React.CSSProperties = {
  background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px",
  fontSize: 13, fontWeight: 600, color: "var(--text)", cursor: "pointer",
};

/**
 * Botón + modal para que el admin registre una carga en CUALQUIER fecha
 * (sirve para cargar días pasados). Reusa `marcarCarga`, que hace upsert por
 * cuenta+día: si ya había una carga ese día para esa cuenta, la pisa.
 */
export function AgregarCargaButton({ cuentas, fechaDefault }: { cuentas: CuentaParaCargar[]; fechaDefault: string }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [fecha, setFecha] = useState(fechaDefault);
  const [clave, setClave] = useState("");
  const [pesos, setPesos] = useState("");
  const [comprados, setComprados] = useState("");
  const [recibidos, setRecibidos] = useState("");
  const [retirados, setRetirados] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cerrar = () => {
    setAbierto(false); setError(null);
    setClave(""); setPesos(""); setComprados(""); setRecibidos(""); setRetirados("");
  };

  const abrir = () => { setFecha(fechaDefault); setAbierto(true); };

  const guardar = async () => {
    if (guardando) return;
    setError(null);
    const cta = cuentas.find((c) => c.clave === clave);
    if (!cta) { setError("Elegí una cuenta."); return; }
    if (!fecha) { setError("Elegí una fecha."); return; }
    setGuardando(true);
    try {
      const r = await marcarCarga(cta.origen, cta.sourceId, fecha, pesos, comprados, recibidos, retirados);
      if (r.ok) { cerrar(); router.refresh(); }
      else setError(r.error);
    } catch { setError("No se pudo conectar. Probá de nuevo."); }
    finally { setGuardando(false); }
  };

  return (
    <>
      <button type="button" onClick={abrir} style={botonDorado}>Agregar carga</button>

      {abierto && (
        <div
          className="cambio-modal-overlay"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", zIndex: 50, padding: 20 }}
          onClick={() => { if (!guardando) cerrar(); }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="cambio-modal"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, width: "min(480px,100%)", maxHeight: "90vh", overflowY: "auto" }}
          >
            <h2 style={{ fontSize: 17, fontWeight: 740, margin: "0 0 16px" }}>Agregar carga</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <div>
                <label style={label}>Fecha</label>
                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={field} />
              </div>
              <div>
                <label style={label}>Cuenta</label>
                <select value={clave} onChange={(e) => setClave(e.target.value)} style={field}>
                  <option value="">— elegí una cuenta —</option>
                  {cuentas.map((c) => <option key={c.clave} value={c.clave}>{c.label}</option>)}
                </select>
              </div>
              <div className="campo-fila" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <div><label style={label}>Pesos cargados</label><input inputMode="decimal" value={pesos} onChange={(e) => setPesos(e.target.value)} style={field} placeholder="0" /></div>
                <div><label style={label}>Dólares comprados</label><input inputMode="decimal" value={comprados} onChange={(e) => setComprados(e.target.value)} style={field} placeholder="0" /></div>
                <div><label style={label}>Dólares retirados</label><input inputMode="decimal" value={retirados} onChange={(e) => setRetirados(e.target.value)} style={field} placeholder="0" /></div>
              </div>

              {error && <p style={{ color: "var(--warn)", fontSize: 12.5, margin: 0 }}>{error}</p>}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                <button type="button" onClick={cerrar} disabled={guardando} style={botonSec}>Cancelar</button>
                <button type="button" onClick={guardar} disabled={guardando} style={{ ...botonDorado, opacity: guardando ? 0.6 : 1 }}>
                  {guardando ? "Guardando…" : "Guardar carga"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
