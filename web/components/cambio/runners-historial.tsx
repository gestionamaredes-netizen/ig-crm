"use client";
import { useState } from "react";
import { Pencil } from "lucide-react";
import type { CuentaGestion, Gestion, PagoRunner, Runner } from "@/lib/cambio/runners";
import { formatearPesos } from "@/lib/formato";
import { EditarGestionButton, EditarPagoButton } from "@/components/cambio/runner-forms";

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

function fecha(iso: string): string {
  return iso.split("-").reverse().join("/");
}

function GestionesHistorial({
  gestiones,
  nombreRunner,
  onEditar,
}: {
  gestiones: Gestion[];
  nombreRunner: (id: string) => string;
  onEditar: (g: Gestion) => void;
}) {
  if (gestiones.length === 0) {
    return (
      <p style={{ fontSize: 13.5, color: "var(--muted)", margin: 0, padding: "6px 0" }}>
        Todavía no cargaste gestiones. Empezá con el botón <b>Nueva gestión</b>.
      </p>
    );
  }

  return (
    <>
      {/* Tarjetas: solo en el celular (la tabla de al lado se oculta por CSS). */}
      <div className="ops-cards" style={{ flexDirection: "column", gap: 10 }}>
        {gestiones.map((g) => (
          <div
            key={g.id}
            style={{
              border: "1px solid var(--border)", borderRadius: 12, padding: "12px 13px",
              display: "flex", flexDirection: "column", gap: 9, background: "var(--card)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                  color: "var(--accent)", border: "1px solid var(--border)", textTransform: "uppercase",
                }}
              >
                {g.tipo}
              </span>
              <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{fecha(g.fecha)}</span>
              <b className="tnum" style={{ marginLeft: "auto", fontSize: 14 }}>{formatearPesos(g.pago)}</b>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{nombreRunner(g.runnerId)}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{g.cuenta || "—"}</div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 9, display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                aria-label="Editar gestión"
                title="Editar"
                onClick={() => onEditar(g)}
                style={botonLapiz}
              >
                <Pencil size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla: escritorio. Se oculta en el celular. */}
      <div className="ops-tabla" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...th, textAlign: "left" }}>Fecha</th>
              <th style={{ ...th, textAlign: "left" }}>Runner</th>
              <th style={{ ...th, textAlign: "left" }}>Cuenta</th>
              <th style={{ ...th, textAlign: "left" }}>Tipo</th>
              <th style={th}>Pago</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {gestiones.map((g) => (
              <tr key={g.id}>
                <td style={{ ...td, textAlign: "left" }}>{fecha(g.fecha)}</td>
                <td style={{ ...td, textAlign: "left" }}>{nombreRunner(g.runnerId)}</td>
                <td style={{ ...td, textAlign: "left" }}>{g.cuenta || "—"}</td>
                <td style={{ ...td, textAlign: "left" }}>
                  <span
                    style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                      color: "var(--accent)", border: "1px solid var(--border)", textTransform: "uppercase",
                    }}
                  >
                    {g.tipo}
                  </span>
                </td>
                <td style={td} className="tnum">{formatearPesos(g.pago)}</td>
                <td style={{ ...td, textAlign: "center" }}>
                  <button
                    type="button"
                    aria-label="Editar gestión"
                    title="Editar"
                    onClick={() => onEditar(g)}
                    style={botonLapiz}
                  >
                    <Pencil size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function PagosHistorial({
  pagos,
  nombreRunner,
  onEditar,
}: {
  pagos: PagoRunner[];
  nombreRunner: (id: string) => string;
  onEditar: (p: PagoRunner) => void;
}) {
  if (pagos.length === 0) {
    return (
      <p style={{ fontSize: 13.5, color: "var(--muted)", margin: 0, padding: "6px 0" }}>
        Todavía no registraste pagos. Empezá con el botón <b>Registrar pago</b>.
      </p>
    );
  }

  return (
    <>
      {/* Tarjetas: solo en el celular (la tabla de al lado se oculta por CSS). */}
      <div className="ops-cards" style={{ flexDirection: "column", gap: 10 }}>
        {pagos.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid var(--border)", borderRadius: 12, padding: "12px 13px",
              display: "flex", flexDirection: "column", gap: 9, background: "var(--card)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{nombreRunner(p.runnerId)}</div>
                <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{fecha(p.fecha)}</div>
              </div>
              <b className="tnum" style={{ marginLeft: "auto", fontSize: 14 }}>{formatearPesos(p.monto)}</b>
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 9, display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                aria-label="Editar pago"
                title="Editar"
                onClick={() => onEditar(p)}
                style={botonLapiz}
              >
                <Pencil size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla: escritorio. Se oculta en el celular. */}
      <div className="ops-tabla" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...th, textAlign: "left" }}>Fecha</th>
              <th style={{ ...th, textAlign: "left" }}>Runner</th>
              <th style={th}>Monto</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {pagos.map((p) => (
              <tr key={p.id}>
                <td style={{ ...td, textAlign: "left" }}>{fecha(p.fecha)}</td>
                <td style={{ ...td, textAlign: "left" }}>{nombreRunner(p.runnerId)}</td>
                <td style={td} className="tnum">{formatearPesos(p.monto)}</td>
                <td style={{ ...td, textAlign: "center" }}>
                  <button
                    type="button"
                    aria-label="Editar pago"
                    title="Editar"
                    onClick={() => onEditar(p)}
                    style={botonLapiz}
                  >
                    <Pencil size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function RunnersHistorial({
  gestiones,
  pagos,
  runners,
  cuentas,
}: {
  gestiones: Gestion[];
  pagos: PagoRunner[];
  runners: Runner[];
  cuentas: CuentaGestion[];
}) {
  const [editandoGestion, setEditandoGestion] = useState<Gestion | null>(null);
  const [editandoPago, setEditandoPago] = useState<PagoRunner | null>(null);

  // Se deriva acá adentro (componente cliente) en vez de recibirlo como prop:
  // pasar una función desde la página (componente servidor) a un componente
  // cliente rompe en runtime ("Functions cannot be passed to Client Components").
  const nombreRunner = (id: string): string => runners.find((r) => r.id === id)?.nombre ?? "—";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px" }}>Gestiones</h2>
        <GestionesHistorial gestiones={gestiones} nombreRunner={nombreRunner} onEditar={setEditandoGestion} />
      </div>
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px" }}>Pagos</h2>
        <PagosHistorial pagos={pagos} nombreRunner={nombreRunner} onEditar={setEditandoPago} />
      </div>

      {/* Montados fuera del map, con key por id: cada apertura resincroniza
          el estado inicial del formulario con la gestión/pago elegido. */}
      {editandoGestion && (
        <EditarGestionButton
          key={editandoGestion.id}
          gestion={editandoGestion}
          runners={runners}
          cuentas={cuentas}
          abierto
          onCerrar={() => setEditandoGestion(null)}
        />
      )}
      {editandoPago && (
        <EditarPagoButton
          key={editandoPago.id}
          pago={editandoPago}
          runners={runners}
          abierto
          onCerrar={() => setEditandoPago(null)}
        />
      )}
    </div>
  );
}
