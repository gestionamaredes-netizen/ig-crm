"use client";
import { Fragment, useState } from "react";
import { Pencil, ChevronDown, ChevronRight } from "lucide-react";
import type { Celular, CuentaOperativa } from "@/lib/cambio/celulares";
import { NuevaCuentaButton, EditarCuentaButton } from "@/components/cambio/celular-forms";

const botonLapiz: React.CSSProperties = {
  background: "var(--card)", border: "1px solid var(--border)", borderRadius: 9,
  padding: "7px 9px", display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", color: "var(--muted)",
};

function CuentasDeCelular({
  celularId, cuentas, onEditar,
}: {
  celularId: string; cuentas: CuentaOperativa[]; onEditar: (c: CuentaOperativa) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 2px 4px" }}>
      {cuentas.length === 0 && (
        <p style={{ fontSize: 12.5, color: "var(--muted)", margin: 0 }}>Este celular todavía no tiene cuentas cargadas.</p>
      )}
      {cuentas.map((c) => (
        <div key={c.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "11px 13px", display: "flex", flexDirection: "column", gap: 6, background: "var(--card)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 650 }}>{c.titular || "—"}</div>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{c.dni}</span>
            <button type="button" aria-label="Editar cuenta" title="Editar" onClick={() => onEditar(c)} style={{ ...botonLapiz, marginLeft: "auto" }}>
              <Pencil size={14} />
            </button>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Pesos: {c.cbuPesos || "—"} · {c.aliasPesos || "—"}</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Dólares: {c.cbuDolares || "—"} · {c.aliasDolares || "—"}</div>
        </div>
      ))}
      <div><NuevaCuentaButton celularId={celularId} /></div>
    </div>
  );
}

export function PanelCelulares({
  celulares, cuentas,
}: {
  celulares: Celular[]; cuentas: CuentaOperativa[];
}) {
  const [editandoCuenta, setEditandoCuenta] = useState<CuentaOperativa | null>(null);
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});
  const cuentasDe = (celularId: string): CuentaOperativa[] => cuentas.filter((c) => c.celularId === celularId);
  const toggle = (id: string) => setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }));

  if (celulares.length === 0) {
    return (
      <p style={{ fontSize: 13.5, color: "var(--muted)", margin: 0, padding: "6px 0" }}>
        Todavía no tenés celulares asignados. Pedile a Capi que te asigne los tuyos.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {celulares.map((c) => {
        const propias = cuentasDe(c.id);
        const abierto = !!expandidos[c.id];
        return (
          <Fragment key={c.id}>
            <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "12px 13px", display: "flex", flexDirection: "column", gap: 9, background: "var(--card)", opacity: c.activo ? 1 : 0.6 }}>
              <div onClick={() => toggle(c.id)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <span aria-hidden style={{ color: "var(--muted)" }}>{abierto ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 650 }}>{c.alias}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{c.modelo || "—"}</div>
                </div>
                <span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--accent)", fontWeight: 600 }}>
                  {abierto ? "Ocultar" : "Ver / agregar"} cuentas ({propias.length})
                </span>
              </div>
              {abierto && (
                <div style={{ borderTop: "1px solid var(--border)" }}>
                  <CuentasDeCelular celularId={c.id} cuentas={propias} onEditar={setEditandoCuenta} />
                </div>
              )}
            </div>
          </Fragment>
        );
      })}

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
