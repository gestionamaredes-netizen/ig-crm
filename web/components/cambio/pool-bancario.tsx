"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { marcarCarga, desmarcarCarga } from "@/app/(app)/cambio/cargas-actions";
import type { Cuenta } from "@/lib/cambio/cuentas";
import type { Carga } from "@/lib/cambio/cargas";
import { BotonCopiarTexto } from "@/components/cambio/copiar";

// Pool compartido de cuentas bancarias para el runner. Todas las cuentas están
// a disposición de todos; cuando alguien marca una como cargada, sale del pool
// para todos ese día. Las cuentas se agrupan por persona (mismo DNI, o mismo
// nombre si no hay DNI) para no repetir el nombre por cada banco.

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

// Bloque de texto para el botón "Copiar datos": nombre + DNI + CBU/alias de la
// cuenta, todo junto para pegar de un toque. NO incluye usuario ni clave. Solo
// agrega las líneas que tienen valor.
function datosParaCopiar(persona: Persona, c: Cuenta): string {
  const lineas = [
    persona.titular,
    persona.dni ? `DNI ${persona.dni}` : "",
    c.cbuPesos ? `CBU pesos: ${c.cbuPesos}` : "",
    c.aliasPesos ? `Alias pesos: ${c.aliasPesos}` : "",
    c.cbuDolares ? `CBU dólares: ${c.cbuDolares}` : "",
    c.aliasDolares ? `Alias dólares: ${c.aliasDolares}` : "",
  ];
  return lineas.filter((l) => l.trim() !== "").join("\n");
}

type Persona = { titular: string; dni: string; cuentas: Cuenta[] };

// Agrupa cuentas por persona: mismo DNI las junta; si no hay DNI, se usa el
// nombre normalizado. Mantiene el orden de entrada (ya viene ordenado por
// titular desde la base).
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

export function PoolBancario({
  cuentas, cargasHoy, miRunnerId, fecha,
}: {
  cuentas: Cuenta[];
  cargasHoy: Carga[];
  miRunnerId: string | null;
  fecha: string;
}) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [marcando, setMarcando] = useState<string | null>(null); // id de cuenta en edición
  const [pesos, setPesos] = useState("");
  const [comprados, setComprados] = useState("");
  const [retirados, setRetirados] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  // Cargas bancarias de hoy: mapa por source_id (cuenta) -> carga. Sirve para
  // ver quién cargó qué y cuándo (para indicador visual).
  const cargaPorCuenta = useMemo(() => {
    const m = new Map<string, Carga>();
    for (const c of cargasHoy) if (c.origen === "bancaria") m.set(c.sourceId, c);
    return m;
  }, [cargasHoy]);

  const q = norm(busqueda);
  // Todas las cuentas, no solo las disponibles. Las cargadas se marcan visualmente.
  const filtradas = cuentas.filter(
    (c) => q === "" || [c.titular, c.banco, c.dni, c.aliasPesos, c.aliasDolares].some((x) => norm(x ?? "").includes(q)),
  );
  const personas = agruparPorPersona(filtradas);

  // Cuentas todavía sin cargar.
  const disponibles = cuentas.filter((c) => !cargaPorCuenta.has(c.id));

  // Lo que cargué yo hoy (para poder desmarcar si me equivoqué).
  const misCargas = cargasHoy.filter((c) => c.origen === "bancaria" && c.runnerId === miRunnerId);

  const abrir = (id: string) => {
    const carga = cargaPorCuenta.get(id);
    setMarcando(id);
    setPesos(carga ? String(carga.pesosCargados) : "");
    setComprados(carga ? String(carga.usdComprados) : "");
    setRetirados(carga ? String(carga.usdRetirados) : "");
    setError(null);
  };
  const cancelar = () => { setMarcando(null); setError(null); };

  const guardar = async (c: Cuenta) => {
    if (ocupado) return;
    setOcupado(true); setError(null);
    try {
      const r = await marcarCarga("bancaria", c.id, fecha, pesos, comprados, retirados);
      if (r.ok) { setMarcando(null); router.refresh(); }
      else setError(r.error);
    } catch { setError("No se pudo conectar. Probá de nuevo."); }
    finally { setOcupado(false); }
  };

  const desmarcar = async (c: Carga) => {
    if (ocupado) return;
    if (!window.confirm("¿Desmarcar esta carga? Vuelve al pool.")) return;
    setOcupado(true);
    try {
      const r = await desmarcarCarga(c.id);
      if (r.ok) router.refresh();
    } catch { /* noop */ }
    finally { setOcupado(false); }
  };

  return (
    <div style={panel}>
      <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>Cuentas para usar</h2>
      <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 14px" }}>
        Elegí una cuenta disponible, copiá los datos y marcala como cargada. Las cuentas cargadas siguen visibles para que otros puedan completar retiradas. Al otro día se reinicia.
      </p>

      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre o banco…"
        style={{ ...field, marginBottom: 14 }}
      />

      <h3 style={{ fontSize: 12.5, fontWeight: 800, color: “var(--accent)”, textTransform: “uppercase”, letterSpacing: 1, margin: “0 0 10px” }}>
        Cuentas disponibles ({disponibles.length}) · Cargadas ({cargaPorCuenta.size})
      </h3>

      {personas.length === 0 ? (
        <p style={{ fontSize: 13, color: “var(--muted)”, margin: “0 0 8px” }}>
          {filtradas.length === 0 ? “No se encontró ninguna cuenta.” : `No se encontró ninguna cuenta con “${busqueda}”.`}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {personas.map((p) => (
            <div key={`${p.dni}|${p.titular}`} style={{ border: "1px solid var(--border)", borderRadius: 12, background: "var(--card)", overflow: "hidden" }}>
              {/* Cabecera de la persona: nombre + DNI a la vista (sin usuario) */}
              <div style={{ padding: "11px 13px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{p.titular || "—"}</span>
                {p.dni && <span style={{ fontSize: 12.5, color: "var(--muted)" }}>DNI {p.dni}</span>}
                <span style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--muted)" }}>
                  {p.cuentas.length} {p.cuentas.length === 1 ? "banco" : "bancos"}
                </span>
              </div>

              {/* Un bloque por banco de esa persona */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                {p.cuentas.map((c, idx) => {
                  const carga = cargaPorCuenta.get(c.id);
                  const misCargaEnEstaCuenta = misCargas.find((mc) => mc.sourceId === c.id);
                  return (
                    <div key={c.id} style={{ padding: "12px 13px", borderTop: idx > 0 ? "1px solid var(--border)" : undefined, opacity: carga ? 0.75 : 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700 }}>🏦 {c.banco || "Banco"}</span>
                        {c.tarjeta && (
                          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.5, padding: "2px 7px", borderRadius: 6, textTransform: "uppercase", color: "var(--accent)", border: "1px solid var(--accent)" }}>
                            Tarjeta
                          </span>
                        )}
                        {carga && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>
                            ✓ Cargada {misCargaEnEstaCuenta ? "por vos" : `por ${carga.runnerId || "admin"}`}
                          </span>
                        )}
                        {marcando !== c.id && !carga && (
                          <button type="button" onClick={() => abrir(c.id)} style={{ ...botonDorado, marginLeft: "auto" }}>
                            Marcar como cargada
                          </button>
                        )}
                        {marcando !== c.id && carga && (
                          <button type="button" onClick={() => abrir(c.id)} style={{ ...botonDorado, marginLeft: "auto" }}>
                            Editar
                          </button>
                        )}
                        {marcando !== c.id && carga && misCargaEnEstaCuenta && (
                          <button type="button" onClick={() => desmarcar(misCargaEnEstaCuenta)} style={{ ...botonSec, color: "var(--warn)" }}>
                            Desmarcar
                          </button>
                        )}
                      </div>

                    {/* Todo a la vista (menos el usuario, que no se muestra). La
                        clave se ve en texto normal. Solo hay un botón para copiar
                        el bloque de datos para enviar (sin usuario ni clave). */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12.5 }}>
                      {c.cbuPesos && <div><span style={{ color: "var(--muted)" }}>CBU pesos:</span> {c.cbuPesos}</div>}
                      {c.aliasPesos && <div><span style={{ color: "var(--muted)" }}>Alias pesos:</span> {c.aliasPesos}</div>}
                      {c.cbuDolares && <div><span style={{ color: "var(--muted)" }}>CBU dólares:</span> {c.cbuDolares}</div>}
                      {c.aliasDolares && <div><span style={{ color: "var(--muted)" }}>Alias dólares:</span> {c.aliasDolares}</div>}
                      <div><span style={{ color: "var(--muted)" }}>Clave:</span> <span style={{ fontWeight: 600 }}>{c.clave || "—"}</span></div>
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <BotonCopiarTexto valor={datosParaCopiar(p, c)} />
                    </div>

                      {marcando === c.id && (() => {
                        const esEdicion = !!carga;
                        return (
                          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                            <div className="campo-fila" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                              <div><label style={label}>Pesos cargados</label><input inputMode="decimal" value={pesos} onChange={(e) => setPesos(e.target.value)} style={field} placeholder="0" /></div>
                              <div><label style={label}>Dólares comprados</label><input inputMode="decimal" value={comprados} onChange={(e) => setComprados(e.target.value)} style={field} placeholder="0" /></div>
                              <div><label style={label}>Dólares retirados</label><input inputMode="decimal" value={retirados} onChange={(e) => setRetirados(e.target.value)} style={field} placeholder="0" /></div>
                            </div>
                            {error && <p style={{ color: "var(--warn)", fontSize: 12.5, margin: 0 }}>{error}</p>}
                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                              <button type="button" onClick={cancelar} disabled={ocupado} style={botonSec}>Cancelar</button>
                              <button type="button" onClick={() => guardar(c)} disabled={ocupado} style={{ ...botonDorado, opacity: ocupado ? 0.6 : 1 }}>
                                {ocupado ? "Guardando…" : esEdicion ? "Actualizar" : "Guardar carga"}
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lo que cargué yo hoy */}
      <h3 style={{ fontSize: 12.5, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, margin: "20px 0 10px" }}>
        Cargadas por vos hoy ({misCargas.length})
      </h3>
      {misCargas.length === 0 ? (
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Todavía no marcaste ninguna.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {misCargas.map((c) => (
            <div key={c.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "11px 13px", background: "var(--card)", opacity: 0.9 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 650 }}>✓ {c.titular || "—"}</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{c.etiqueta || "Bancaria"}</div>
                </div>
                <button type="button" onClick={() => desmarcar(c)} disabled={ocupado} style={{ ...botonSec, color: "var(--warn)" }}>Desmarcar</button>
              </div>
              <div style={{ marginTop: 8, fontSize: 12.5, color: "var(--muted)" }}>
                Pesos: {fmt(c.pesosCargados)} · Comprados: USD {fmt(c.usdComprados)} · Retirados: USD {fmt(c.usdRetirados)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
