"use client";
import { Fragment, useState } from "react";
import { Pencil, ChevronDown, ChevronRight } from "lucide-react";
import type { Celular, CuentaOperativa } from "@/lib/cambio/celulares";
import type { Runner } from "@/lib/cambio/runners";
import { EditarCelularButton, NuevaCuentaButton, EditarCuentaButton } from "@/components/cambio/celular-forms";
import { ClaveSecreta } from "@/components/cambio/clave-secreta";

const th: React.CSSProperties = {
  textAlign: "right", fontSize: 11, color: "var(--muted)", fontWeight: 600,
  padding: "0 0 10px", whiteSpace: "nowrap",
};
const td: React.CSSProperties = {
  textAlign: "right", fontSize: 13, padding: "11px 0", borderTop: "1px solid var(--border)",
  whiteSpace: "nowrap",
};
const botonLapiz: React.CSSProperties = {
  background: "var(--card)", border: "1px solid var(--border)", borderRadius: 9,
  padding: "7px 9px", display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", color: "var(--muted)",
};
const botonExpandir: React.CSSProperties = {
  background: "transparent", border: 0, padding: "7px 4px", display: "inline-flex",
  alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--muted)",
};

function estadoBadge(activo: boolean): React.CSSProperties {
  return {
    fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 6, textTransform: "uppercase",
    color: activo ? "var(--accent)" : "var(--warn)", border: "1px solid var(--border)",
  };
}

/**
 * Cuentas operativas de un celular, en tarjetas. Mismo bloque para el
 * celular y el escritorio: dentro de una fila de tabla expandida no vale la
 * pena duplicar en otra tabla anidada, así que esto no participa del doble
 * render .ops-cards/.ops-tabla como sí lo hace la lista de celulares.
 */
function CuentasDeCelular({
  celularId,
  cuentas,
  onEditar,
}: {
  celularId: string;
  cuentas: CuentaOperativa[];
  onEditar: (c: CuentaOperativa) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 2px 4px" }}>
      {cuentas.length === 0 && (
        <p style={{ fontSize: 12.5, color: "var(--muted)", margin: 0 }}>Este celular todavía no tiene cuentas cargadas.</p>
      )}
      {cuentas.map((c) => (
        <div
          key={c.id}
          style={{
            border: "1px solid var(--border)", borderRadius: 12, padding: "11px 13px",
            display: "flex", flexDirection: "column", gap: 6, background: "var(--card)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 650 }}>{c.titular || "—"}</div>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{c.dni}</span>
            <span
              style={{
                marginLeft: "auto", fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 6,
                textTransform: "uppercase", color: c.estado === "bloqueada" ? "var(--warn)" : "var(--accent)",
                border: "1px solid var(--border)",
              }}
            >
              {c.estado}
            </span>
            <button type="button" aria-label="Editar cuenta" title="Editar" onClick={() => onEditar(c)} style={botonLapiz}>
              <Pencil size={14} />
            </button>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
            Pesos: {c.cbuPesos || "—"} · {c.aliasPesos || "—"}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
            Dólares: {c.cbuDolares || "—"} · {c.aliasDolares || "—"}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            Usuario: {c.usuario || "—"} · Clave: <ClaveSecreta valor={c.clave} />
          </div>
        </div>
      ))}
      <div>
        <NuevaCuentaButton celularId={celularId} />
      </div>
    </div>
  );
}

export function CelularesLista({
  celulares,
  cuentas,
  runners,
}: {
  celulares: Celular[];
  cuentas: CuentaOperativa[];
  runners: Runner[];
}) {
  const [editandoCelular, setEditandoCelular] = useState<Celular | null>(null);
  const [editandoCuenta, setEditandoCuenta] = useState<CuentaOperativa | null>(null);
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});

  // Se deriva acá adentro (componente cliente) en vez de recibir una función
  // desde la página (componente servidor): pasar funciones de servidor a
  // cliente rompe en runtime. Mismo criterio que nombreRunner en
  // runners-historial.tsx.
  const nombreRunner = (id: string | null): string => {
    if (!id) return "Sin runner";
    return runners.find((r) => r.id === id)?.nombre ?? "—";
  };

  const cuentasDe = (celularId: string): CuentaOperativa[] => cuentas.filter((c) => c.celularId === celularId);

  const toggle = (id: string) => setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }));

  if (celulares.length === 0) {
    return (
      <p style={{ fontSize: 13.5, color: "var(--muted)", margin: 0, padding: "6px 0" }}>
        Todavía no cargaste celulares. Empezá con el botón <b>Nuevo celular</b>.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Tarjetas: solo en el celular (la tabla de al lado se oculta por CSS). */}
      <div className="ops-cards" style={{ flexDirection: "column", gap: 10 }}>
        {celulares.map((c) => {
          const propias = cuentasDe(c.id);
          const abierto = !!expandidos[c.id];
          return (
            <div
              key={c.id}
              style={{
                border: "1px solid var(--border)", borderRadius: 12, padding: "12px 13px",
                display: "flex", flexDirection: "column", gap: 9, background: "var(--card)", opacity: c.activo ? 1 : 0.6,
              }}
            >
              <div
                onClick={() => toggle(c.id)}
                style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
              >
                <span style={botonExpandir} aria-hidden>
                  {abierto ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 650 }}>{c.alias}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{c.modelo || "—"}</div>
                </div>
                <span style={{ marginLeft: "auto", ...estadoBadge(c.activo) }}>{c.activo ? "Activo" : "Fuera de uso"}</span>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{nombreRunner(c.runnerId)}</div>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 9, display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => toggle(c.id)}
                  style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 9, padding: "8px 12px", fontSize: 12.5, fontWeight: 600, color: "var(--accent)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  {abierto ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  {abierto ? "Ocultar" : "Ver / agregar"} cuentas ({propias.length})
                </button>
                <button
                  type="button"
                  aria-label="Editar celular"
                  title="Editar teléfono"
                  onClick={() => setEditandoCelular(c)}
                  style={{ ...botonLapiz, marginLeft: "auto" }}
                >
                  <Pencil size={16} />
                </button>
              </div>
              {abierto && (
                <div style={{ borderTop: "1px solid var(--border)" }}>
                  <CuentasDeCelular celularId={c.id} cuentas={propias} onEditar={setEditandoCuenta} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tabla: escritorio. Se oculta en el celular. */}
      <div className="ops-tabla" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}></th>
              <th style={{ ...th, textAlign: "left" }}>Alias</th>
              <th style={{ ...th, textAlign: "left" }}>Modelo</th>
              <th style={{ ...th, textAlign: "left" }}>Runner</th>
              <th style={{ ...th, textAlign: "center" }}>Cuentas</th>
              <th style={{ ...th, textAlign: "left", paddingLeft: 14 }}>Estado</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {celulares.map((c) => {
              const propias = cuentasDe(c.id);
              const abierto = !!expandidos[c.id];
              return (
                <Fragment key={c.id}>
                  <tr style={{ opacity: c.activo ? 1 : 0.6 }}>
                    <td style={{ ...td, textAlign: "left", width: 30 }}>
                      <button
                        type="button"
                        aria-label={abierto ? "Contraer cuentas" : "Expandir cuentas"}
                        onClick={() => toggle(c.id)}
                        style={botonExpandir}
                      >
                        {abierto ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                    </td>
                    <td style={{ ...td, textAlign: "left" }}>{c.alias}</td>
                    <td style={{ ...td, textAlign: "left" }}>{c.modelo || "—"}</td>
                    <td style={{ ...td, textAlign: "left" }}>{nombreRunner(c.runnerId)}</td>
                    <td style={{ ...td, textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => toggle(c.id)}
                        style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 9, padding: "6px 11px", fontSize: 12.5, fontWeight: 600, color: "var(--accent)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
                      >
                        {abierto ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        {abierto ? "Ocultar" : "Ver / agregar"} ({propias.length})
                      </button>
                    </td>
                    <td style={{ ...td, textAlign: "left" }}>
                      <span style={estadoBadge(c.activo)}>{c.activo ? "Activo" : "Fuera de uso"}</span>
                    </td>
                    <td style={{ ...td, textAlign: "center" }}>
                      <button
                        type="button"
                        aria-label="Editar celular"
                        title="Editar"
                        onClick={() => setEditandoCelular(c)}
                        style={botonLapiz}
                      >
                        <Pencil size={15} />
                      </button>
                    </td>
                  </tr>
                  {abierto && (
                    <tr>
                      <td></td>
                      <td colSpan={6} style={{ padding: "0 0 14px" }}>
                        <CuentasDeCelular celularId={c.id} cuentas={propias} onEditar={setEditandoCuenta} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Montados fuera del map, con key por id: cada apertura resincroniza
          el estado inicial del formulario con el celular/cuenta elegido. */}
      {editandoCelular && (
        <EditarCelularButton
          key={editandoCelular.id}
          celular={editandoCelular}
          runners={runners}
          abierto
          onCerrar={() => setEditandoCelular(null)}
        />
      )}
      {editandoCuenta && (
        <EditarCuentaButton
          key={editandoCuenta.id}
          cuenta={editandoCuenta}
          abierto
          onCerrar={() => setEditandoCuenta(null)}
        />
      )}
    </div>
  );
}
