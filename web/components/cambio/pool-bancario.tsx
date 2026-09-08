"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { marcarCarga, desmarcarCarga } from "@/app/(app)/cambio/cargas-actions";
import type { Cuenta } from "@/lib/cambio/cuentas";
import type { Carga } from "@/lib/cambio/cargas";
import { BotonCopiarTexto } from "@/components/cambio/copiar";

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
function norm(s: string): string {
  return s.trim().toLowerCase();
}

function datosParaCopiar(persona: Persona, c: Cuenta): string {
  const lineas = [
    persona.titular,
    persona.dni ? `DNI ${persona.dni}` : "",
    c.cbuPesos ? `CBU pesos: ${c.cbuPesos}` : "",
    c.aliasPesos ? `Alias pesos: ${c.aliasPesos}` : "",
    c.cbuDolares ? `CBU dolares: ${c.cbuDolares}` : "",
    c.aliasDolares ? `Alias dolares: ${c.aliasDolares}` : "",
  ];
  return lineas.filter((l) => l.trim() !== "").join("\n");
}

type Persona = { titular: string; dni: string; cuentas: Cuenta[] };

function agruparPorPersona(cuentas: Cuenta[]): Persona[] {
  const grupos = new Map<string, Persona>();
  for (const c of cuentas) {
    const clave = c.dni.trim() !== "" ? `dni:${c.dni.trim()}` : `nom:${norm(c.titular)}`;
    const g = grupos.get(clave);
    if (g) g.cuentas.push(c);
    else grupos.set(clave, { titular: c.titular, dni: c.dni, cuentas: [c] });
  }
  return [...grupos.values()];
}

export function PoolBancario({ cuentas, cargasHoy, miRunnerId, fecha }: { cuentas: Cuenta[]; cargasHoy: Carga[]; miRunnerId: string | null; fecha: string }) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [marcando, setMarcando] = useState<string | null>(null);
  const [pesos, setPesos] = useState("");
  const [comprados, setComprados] = useState("");
  const [retirados, setRetirados] = useState("");
  const [recibidos, setRecibidos] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const cargaPorCuenta = useMemo(() => {
    const m = new Map<string, Carga>();
    for (const c of cargasHoy) if (c.origen === "bancaria") m.set(c.sourceId, c);
    return m;
  }, [cargasHoy]);

  const q = norm(busqueda);
  const filtradas = cuentas.filter((c) => q === "" || [c.titular, c.banco, c.dni, c.aliasPesos, c.aliasDolares].some((x) => norm(x ?? "").includes(q)));
  const personas = agruparPorPersona(filtradas);
  const disponibles = cuentas.filter((c) => !cargaPorCuenta.has(c.id));
  const misCargas = cargasHoy.filter((c) => c.origen === "bancaria" && c.runnerId === miRunnerId);

  const abrir = (id: string) => {
    const carga = cargaPorCuenta.get(id);
    setMarcando(id);
    setPesos(carga ? String(carga.pesosCargados) : "");
    setComprados(carga ? String(carga.usdComprados) : "");
    setRetirados(carga ? String(carga.usdRetirados) : "");
    setRecibidos("");
    setError(null);
  };
  const cancelar = () => {
    setMarcando(null);
    setError(null);
  };

  const guardar = async (c: Cuenta) => {
    if (ocupado) return;
    setOcupado(true);
    setError(null);
    try {
      const r = await marcarCarga("bancaria", c.id, fecha, pesos, comprados, recibidos, retirados);
      if (r.ok) {
        setMarcando(null);
        router.refresh();
      } else {
        setError(r.error);
      }
    } catch {
      setError("No se pudo conectar.");
    } finally {
      setOcupado(false);
    }
  };

  const desmarcar = async (c: Carga) => {
    if (ocupado) return;
    if (!window.confirm("Desmarcar esta carga?")) return;
    setOcupado(true);
    try {
      const r = await desmarcarCarga(c.id);
      if (r.ok) router.refresh();
    } catch {}
    finally {
      setOcupado(false);
    }
  };

  return (
    <div style={panel}>
      <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>Cuentas para usar</h2>
      <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar..." style={{ ...field, marginBottom: 14 }} />
      <h3 style={{ fontSize: 12.5, fontWeight: 800, color: "var(--accent)", margin: "0 0 10px" }}>
        Disponibles: {disponibles.length} | Cargadas: {cargaPorCuenta.size}
      </h3>
      {personas.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--muted)" }}>No hay cuentas</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {personas.map((p) => (
            <div key={`${p.dni}|${p.titular}`} style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--card)", overflow: "hidden" }}>
              <div style={{ padding: "11px 13px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{p.titular}</span>
                {p.dni && <span style={{ fontSize: 12.5, color: "var(--muted)" }}>DNI {p.dni}</span>}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {p.cuentas.map((c, idx) => {
                  const carga = cargaPorCuenta.get(c.id);
                  return (
                    <div key={c.id} style={{ padding: "12px 13px", borderTop: idx > 0 ? "1px solid var(--border)" : undefined }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700 }}>{c.banco}</span>
                        {carga && <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>Cargada</span>}
                        {marcando !== c.id && (
                          <button type="button" onClick={() => abrir(c.id)} style={{ ...botonDorado, marginLeft: "auto", fontSize: 12 }}>
                            {carga ? "Editar" : "Registrar"}
                          </button>
                        )}
                      </div>
                      {c.cbuPesos && <div style={{ fontSize: 12 }}>CBU pesos: {c.cbuPesos}</div>}
                      {c.aliasPesos && <div style={{ fontSize: 12 }}>Alias pesos: {c.aliasPesos}</div>}
                      {c.cbuDolares && <div style={{ fontSize: 12 }}>CBU dolares: {c.cbuDolares}</div>}
                      {marcando === c.id && (
                        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            <div><label style={label}>Pesos</label><input inputMode="decimal" value={pesos} onChange={(e) => setPesos(e.target.value)} style={field} /></div>
                            <div><label style={label}>Dolares</label><input inputMode="decimal" value={comprados} onChange={(e) => setComprados(e.target.value)} style={field} /></div>
                          </div>
                          {error && <p style={{ color: "red", fontSize: 12, margin: 0 }}>{error}</p>}
                          <div style={{ display: "flex", gap: 8 }}>
                            <button type="button" onClick={cancelar} style={botonSec}>Cancelar</button>
                            <button type="button" onClick={() => guardar(c)} style={{ ...botonDorado, opacity: ocupado ? 0.6 : 1 }}>
                              {ocupado ? "..." : "Guardar"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
