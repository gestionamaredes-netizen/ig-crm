"use client";
import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import type { Cuenta } from "@/lib/cambio/cuentas";
import type { Runner } from "@/lib/cambio/runners";
import type { FilaPersona } from "@/lib/cambio/reportes";
import { EditarCuentaBancariaButton, AgregarBancoButton } from "@/components/cambio/cuenta-forms";
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

function usd(n: number): string {
  return n.toLocaleString("es-AR", { maximumFractionDigits: 2 });
}

// Sello para las cuentas que se manejan por tarjeta (no por celular).
const selloTarjeta: React.CSSProperties = {
  fontSize: 10.5, fontWeight: 800, letterSpacing: 0.5, padding: "2px 8px", borderRadius: 6,
  textTransform: "uppercase", color: "var(--accent)", border: "1px solid var(--accent)", whiteSpace: "nowrap",
};

/**
 * Movimiento de una cuenta por titular: matchea contra `movimientos`
 * (rankingPersonas) por nombre normalizado, igual que rankingPersonas ya
 * agrupa "Ana Perez" con "ana perez ". Se deriva ACÁ ADENTRO del componente
 * cliente en vez de recibir una función desde la página servidor: pasar
 * funciones de servidor a cliente rompe en runtime (ver celulares-lista.tsx).
 */
function movimientoDe(titular: string, movimientos: FilaPersona[]): FilaPersona | undefined {
  const clave = titular.trim().toLowerCase();
  return movimientos.find((m) => m.persona.trim().toLowerCase() === clave);
}

export function CuentasLista({
  cuentas,
  movimientos,
  runners,
}: {
  cuentas: Cuenta[];
  movimientos: FilaPersona[];
  runners: Runner[];
}) {
  const [editando, setEditando] = useState<Cuenta | null>(null);
  const [agregandoBanco, setAgregandoBanco] = useState<Cuenta | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState<"titular" | "runner">("titular");

  if (cuentas.length === 0) {
    return (
      <p style={{ fontSize: 13.5, color: "var(--muted)", margin: 0, padding: "6px 0" }}>
        Todavía no cargaste cuentas. Empezá con el botón <b>Nueva cuenta</b>.
      </p>
    );
  }

  // Buscador + orden (todo en el navegador, sobre las cuentas ya cargadas).
  // Se busca por titular, runner, DNI, alias o usuario: escribir "ale" trae
  // todas las cuentas de ese runner. `.filter` crea un array nuevo, así que
  // el `.sort` no toca la prop original.
  const norm = (s: string) => s.trim().toLowerCase();
  const q = norm(busqueda);
  const visibles = cuentas
    .filter((c) =>
      q === "" ||
      [c.titular, c.runner, c.dni, c.banco, c.aliasPesos, c.aliasDolares, c.usuario].some((campo) => norm(campo ?? "").includes(q)),
    )
    .sort((a, b) => {
      if (orden === "runner") {
        const r = norm(a.runner).localeCompare(norm(b.runner));
        if (r !== 0) return r;
      }
      return norm(a.titular).localeCompare(norm(b.titular));
    });

  const inputBuscar: React.CSSProperties = {
    flex: "1 1 240px", minWidth: 0, background: "var(--card)", border: "1px solid var(--border)",
    borderRadius: 11, padding: "10px 13px", fontSize: 16, color: "var(--text)", fontFamily: "inherit",
  };
  const selectOrden: React.CSSProperties = {
    background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11,
    padding: "10px 12px", fontSize: 13, color: "var(--text)", fontFamily: "inherit",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por titular, runner, alias o DNI…"
          style={inputBuscar}
        />
        <select value={orden} onChange={(e) => setOrden(e.target.value as "titular" | "runner")} style={selectOrden}>
          <option value="titular">Ordenar por nombre</option>
          <option value="runner">Ordenar por runner</option>
        </select>
        <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{visibles.length} de {cuentas.length}</span>
      </div>

      {visibles.length === 0 ? (
        <p style={{ fontSize: 13.5, color: "var(--muted)", margin: 0, padding: "6px 0" }}>
          No se encontró ninguna cuenta con “{busqueda}”.
        </p>
      ) : (
      <>
      {/* Tarjetas: solo en el celular (la tabla de al lado se oculta por CSS). */}
      <div className="ops-cards" style={{ flexDirection: "column", gap: 10 }}>
        {visibles.map((c, i) => {
          const mov = movimientoDe(c.titular, movimientos);
          return (
            <div
              key={c.id}
              style={{
                border: "1px solid var(--border)", borderRadius: 12, padding: "12px 13px",
                display: "flex", flexDirection: "column", gap: 8, background: "var(--card)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--muted)", minWidth: 22 }}>{i + 1}</span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 650 }}>{c.titular || "—"}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{c.dni || "—"}</div>
                </div>
                {c.tarjeta && <span style={{ ...selloTarjeta, marginLeft: 4 }}>Tarjeta</span>}
                <button
                  type="button"
                  title="Agregar banco a esta persona"
                  onClick={() => setAgregandoBanco(c)}
                  style={{ ...botonLapiz, marginLeft: "auto", gap: 4, fontSize: 12, fontWeight: 700 }}
                >
                  <Plus size={14} /> banco
                </button>
                <button
                  type="button"
                  aria-label="Editar cuenta"
                  title="Editar"
                  onClick={() => setEditando(c)}
                  style={botonLapiz}
                >
                  <Pencil size={16} />
                </button>
              </div>
              {c.banco && <div style={{ fontSize: 12.5, color: "var(--text)", fontWeight: 600 }}>🏦 {c.banco}</div>}
              <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Runner: {c.runner || "Sin runner"}</div>
              <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
                Pesos: {c.cbuPesos || "—"} · {c.aliasPesos || "—"}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
                Dólares: {c.cbuDolares || "—"} · {c.aliasDolares || "—"}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                Usuario: {c.usuario || "—"} · Clave: <ClaveSecreta valor={c.clave} />
              </div>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8, fontSize: 12.5, color: "var(--muted)" }}>
                Como emisor: {usd(mov?.comoEmisor ?? 0)} · Como receptor: {usd(mov?.comoReceptor ?? 0)} ·
                {" "}Volumen: {usd(mov?.volumen ?? 0)} · Ops: {mov?.operaciones ?? 0}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabla: escritorio. Se oculta en el celular. */}
      <div className="ops-tabla" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...th, textAlign: "left" }}>#</th>
              <th style={{ ...th, textAlign: "left" }}>Titular</th>
              <th style={{ ...th, textAlign: "left" }}>Banco</th>
              <th style={{ ...th, textAlign: "left" }}>DNI</th>
              <th style={{ ...th, textAlign: "left" }}>Runner</th>
              <th style={{ ...th, textAlign: "left" }}>Pesos</th>
              <th style={{ ...th, textAlign: "left" }}>Dólares</th>
              <th style={{ ...th, textAlign: "left" }}>Acceso</th>
              <th style={th}>Como emisor</th>
              <th style={th}>Como receptor</th>
              <th style={th}>Volumen</th>
              <th style={th}>Ops</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((c, i) => {
              const mov = movimientoDe(c.titular, movimientos);
              return (
                <tr key={c.id}>
                  <td style={{ ...td, textAlign: "left", color: "var(--muted)" }} className="tnum">{i + 1}</td>
                  <td style={{ ...td, textAlign: "left" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      {c.titular || "—"}
                      {c.tarjeta && <span style={selloTarjeta}>Tarjeta</span>}
                    </span>
                  </td>
                  <td style={{ ...td, textAlign: "left" }}>{c.banco || "—"}</td>
                  <td style={{ ...td, textAlign: "left" }}>{c.dni || "—"}</td>
                  <td style={{ ...td, textAlign: "left" }}>{c.runner || "—"}</td>
                  <td style={{ ...td, textAlign: "left" }}>
                    {c.cbuPesos || "—"} · {c.aliasPesos || "—"}
                  </td>
                  <td style={{ ...td, textAlign: "left" }}>
                    {c.cbuDolares || "—"} · {c.aliasDolares || "—"}
                  </td>
                  <td style={{ ...td, textAlign: "left" }}>
                    <span style={{ display: "inline-flex", flexDirection: "column", gap: 2 }}>
                      <span>{c.usuario || "—"}</span>
                      <ClaveSecreta valor={c.clave} />
                    </span>
                  </td>
                  <td style={td} className="tnum">{usd(mov?.comoEmisor ?? 0)}</td>
                  <td style={td} className="tnum">{usd(mov?.comoReceptor ?? 0)}</td>
                  <td style={td} className="tnum">{usd(mov?.volumen ?? 0)}</td>
                  <td style={td} className="tnum">{mov?.operaciones ?? 0}</td>
                  <td style={{ ...td, textAlign: "center" }}>
                    <span style={{ display: "inline-flex", gap: 6 }}>
                      <button
                        type="button"
                        title="Agregar banco a esta persona"
                        onClick={() => setAgregandoBanco(c)}
                        style={botonLapiz}
                      >
                        <Plus size={15} />
                      </button>
                      <button
                        type="button"
                        aria-label="Editar cuenta"
                        title="Editar"
                        onClick={() => setEditando(c)}
                        style={botonLapiz}
                      >
                        <Pencil size={15} />
                      </button>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </>
      )}

      {/* Montado fuera del map, con key por id: cada apertura resincroniza
          el estado inicial del formulario con la cuenta elegida. */}
      {editando && (
        <EditarCuentaBancariaButton
          key={editando.id}
          cuenta={editando}
          abierto
          onCerrar={() => setEditando(null)}
          runners={runners}
        />
      )}

      {/* Alta de otro banco para la misma persona, con los datos ya precargados. */}
      {agregandoBanco && (
        <AgregarBancoButton
          key={`banco-${agregandoBanco.id}`}
          desde={agregandoBanco}
          abierto
          onCerrar={() => setAgregandoBanco(null)}
          runners={runners}
        />
      )}
    </div>
  );
}
