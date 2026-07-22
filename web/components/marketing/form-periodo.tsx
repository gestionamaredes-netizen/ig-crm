"use client";
import { useState } from "react";
import { Plus, X, Upload } from "lucide-react";
import { crearCampana, cargarPeriodo } from "@/app/(app)/marketing/actions";
import type { Opcion, OpcionCuenta } from "@/lib/pautas/datos";

const campo: React.CSSProperties = {
  width: "100%",
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "10px 12px",
  color: "var(--text)",
  fontSize: 13,
  outline: "none",
  fontFamily: "inherit",
};

function Modal({
  titulo,
  onClose,
  onSubmit,
  children,
}: {
  titulo: string;
  onClose: () => void;
  onSubmit: (fd: FormData) => Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.55)",
        backdropFilter: "blur(3px)",
        zIndex: 50,
        display: "grid",
        placeItems: "center",
        padding: 20,
      }}
    >
      <form
        action={async (fd) => {
          await onSubmit(fd);
          onClose();
        }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 460,
          maxWidth: "100%",
          background: "var(--panel-2)",
          border: "1px solid var(--border-2)",
          borderRadius: 18,
          padding: 22,
          boxShadow: "0 30px 70px -20px #000",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
          <b style={{ fontSize: 16, fontWeight: 720 }}>{titulo}</b>
          <button
            type="button"
            onClick={onClose}
            style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--faint)", cursor: "pointer" }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>{children}</div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button
            type="button"
            onClick={onClose}
            style={{ flex: 1, background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 11, padding: "11px 0", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            style={{ flex: 1, background: "var(--accent)", border: "none", color: "#fff", borderRadius: 11, padding: "11px 0", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}

export function BotonesCarga({ cuentas, campanas }: { cuentas: OpcionCuenta[]; campanas: Opcion[] }) {
  const [abierto, setAbierto] = useState<"campana" | "periodo" | null>(null);
  const hoy = new Date().toISOString().slice(0, 10);

  const boton: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: "var(--card)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    borderRadius: 10,
    padding: "9px 14px",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
  };

  return (
    <>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setAbierto("campana")} style={boton} disabled={cuentas.length === 0}>
          <Plus size={15} /> Nueva campaña
        </button>
        <button onClick={() => setAbierto("periodo")} style={boton} disabled={campanas.length === 0}>
          <Upload size={15} /> Cargar período
        </button>
      </div>

      {abierto === "campana" && (
        <Modal titulo="Nueva campaña" onClose={() => setAbierto(null)} onSubmit={crearCampana}>
          <input name="nombre" placeholder="Nombre de la campaña" required style={campo} />
          <select name="cuentaId" required style={campo} defaultValue={cuentas[0]?.id}>
            {cuentas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <input name="externalId" placeholder="ID en la plataforma (opcional)" style={campo} />
          <div style={{ display: "flex", gap: 11 }}>
            <input name="presupuesto" placeholder="Presupuesto diario ($)" inputMode="numeric" style={{ ...campo, flex: 1 }} />
            <select name="estado" style={{ ...campo, flex: 1 }} defaultValue="borrador">
              <option value="borrador">Borrador</option>
              <option value="activa">Activa</option>
              <option value="pausada">Pausada</option>
              <option value="finalizada">Finalizada</option>
            </select>
          </div>
          <select name="objetivo" style={campo} defaultValue="leads">
            <option value="leads">Objetivo: Leads</option>
            <option value="trafico">Objetivo: Tráfico</option>
            <option value="ventas">Objetivo: Ventas</option>
          </select>
        </Modal>
      )}

      {abierto === "periodo" && (
        <Modal titulo="Cargar período" onClose={() => setAbierto(null)} onSubmit={cargarPeriodo}>
          <select name="campanaId" required style={campo} defaultValue={campanas[0]?.id}>
            {campanas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <div style={{ display: "flex", gap: 11 }}>
            <input name="desde" type="date" required defaultValue={hoy} style={{ ...campo, flex: 1 }} />
            <input name="hasta" type="date" required defaultValue={hoy} style={{ ...campo, flex: 1 }} />
          </div>
          <div style={{ display: "flex", gap: 11 }}>
            <input name="impresiones" placeholder="Impresiones" inputMode="numeric" style={{ ...campo, flex: 1 }} />
            <input name="clics" placeholder="Clics" inputMode="numeric" style={{ ...campo, flex: 1 }} />
          </div>
          <div style={{ display: "flex", gap: 11 }}>
            <input name="costo" placeholder="Gasto ($)" inputMode="numeric" style={{ ...campo, flex: 1 }} />
            <input name="clicsWhatsapp" placeholder="Clics a WhatsApp" inputMode="numeric" style={{ ...campo, flex: 1 }} />
          </div>
          <span style={{ fontSize: 11, color: "var(--faint)" }}>
            Si ya cargaste este mismo tramo a mano, esta carga lo reemplaza.
          </span>
        </Modal>
      )}
    </>
  );
}
