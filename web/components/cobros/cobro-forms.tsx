"use client";
import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import {
  crearCobro,
  agregarCosto,
  agregarPago,
  editarCliente,
  editarCobro,
  editarCosto,
  editarPago,
} from "@/app/(app)/cobros/actions";
import { Modal, campo } from "./ui";

/** Disparador chico de "editar" (lápiz) reutilizable. */
function LinkEditar({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Editar"
      style={{ background: "none", border: "none", color: "var(--faint)", cursor: "pointer", padding: 0, display: "inline-flex" }}
    >
      <Pencil size={13} />
    </button>
  );
}

const chip: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  background: "var(--card)",
  border: "1px solid var(--border)",
  color: "var(--muted)",
  borderRadius: 9,
  padding: "6px 10px",
  fontSize: 11.5,
  fontWeight: 600,
  cursor: "pointer",
};

const hoy = () => new Date().toISOString().slice(0, 10);

export function BotonNuevoCobro({ clienteId }: { clienteId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--accent)", color: "#fff", border: "none", borderRadius: 10, padding: "9px 14px", fontSize: 12.5, fontWeight: 650, cursor: "pointer" }}
      >
        <Plus size={15} /> Nuevo cobro
      </button>
      {open && (
        <Modal titulo="Nuevo cobro" onClose={() => setOpen(false)} onSubmit={crearCobro}>
          <input type="hidden" name="clienteId" value={clienteId} />
          <input name="concepto" placeholder="Concepto (ej: Gestión de redes octubre)" style={campo} />
          <div style={{ display: "flex", gap: 11 }}>
            <input name="total" placeholder="Facturado ($)" inputMode="numeric" required style={{ ...campo, flex: 1 }} />
            <input name="fecha" type="date" defaultValue={hoy()} style={{ ...campo, flex: 1 }} />
          </div>
          <span style={{ fontSize: 11, color: "var(--faint)" }}>Después le cargás los costos de producción y los pagos.</span>
        </Modal>
      )}
    </>
  );
}

export function BotonAgregarCosto({ cobroId, clienteId }: { cobroId: string; clienteId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} style={chip}>
        <Plus size={13} /> Costo
      </button>
      {open && (
        <Modal titulo="Agregar costo de producción" onClose={() => setOpen(false)} onSubmit={agregarCosto}>
          <input type="hidden" name="cobroId" value={cobroId} />
          <input type="hidden" name="clienteId" value={clienteId} />
          <input name="concepto" placeholder="Concepto (ej: Filmaker, Viáticos)" required style={campo} />
          <input name="monto" placeholder="Monto ($)" inputMode="numeric" required style={campo} />
          <span style={{ fontSize: 11, color: "var(--faint)" }}>Solo costos de terceros. Tu trabajo se paga vía el 70%, no va acá.</span>
        </Modal>
      )}
    </>
  );
}

export function BotonAgregarPago({ cobroId, clienteId }: { cobroId: string; clienteId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} style={chip}>
        <Plus size={13} /> Pago
      </button>
      {open && (
        <Modal titulo="Registrar pago" onClose={() => setOpen(false)} onSubmit={agregarPago}>
          <input type="hidden" name="cobroId" value={cobroId} />
          <input type="hidden" name="clienteId" value={clienteId} />
          <div style={{ display: "flex", gap: 11 }}>
            <input name="monto" placeholder="Monto ($)" inputMode="numeric" required style={{ ...campo, flex: 1 }} />
            <input name="fecha" type="date" defaultValue={hoy()} style={{ ...campo, flex: 1 }} />
          </div>
          <div style={{ display: "flex", gap: 11 }}>
            <input name="medio" placeholder="Medio (PREX, efectivo…)" style={{ ...campo, flex: 1 }} />
            <input name="cuenta" placeholder="Cuenta (Fabricio · PREX)" style={{ ...campo, flex: 1 }} />
          </div>
        </Modal>
      )}
    </>
  );
}

// ————————————————————————————— Edición —————————————————————————————

export function EditarCliente({ id, nombre, tipo, notas }: { id: string; nombre: string; tipo: string; notas: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <LinkEditar onClick={() => setOpen(true)} />
      {open && (
        <Modal titulo="Editar cliente" onClose={() => setOpen(false)} onSubmit={editarCliente} textoGuardar="Guardar cambios">
          <input type="hidden" name="id" value={id} />
          <input name="nombre" defaultValue={nombre} required style={campo} />
          <select name="tipo" defaultValue={tipo} style={campo}>
            <option value="unico">Trabajo único</option>
            <option value="mensual">Mensual</option>
          </select>
          <input name="notas" defaultValue={notas} placeholder="Notas" style={campo} />
        </Modal>
      )}
    </>
  );
}

export function EditarCobro({ id, clienteId, concepto, total, fecha }: { id: string; clienteId: string; concepto: string; total: number; fecha: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <LinkEditar onClick={() => setOpen(true)} />
      {open && (
        <Modal titulo="Editar cobro" onClose={() => setOpen(false)} onSubmit={editarCobro} textoGuardar="Guardar cambios">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="clienteId" value={clienteId} />
          <input name="concepto" defaultValue={concepto} placeholder="Concepto" style={campo} />
          <div style={{ display: "flex", gap: 11 }}>
            <input name="total" defaultValue={String(total)} inputMode="numeric" required style={{ ...campo, flex: 1 }} />
            <input name="fecha" type="date" defaultValue={fecha} style={{ ...campo, flex: 1 }} />
          </div>
        </Modal>
      )}
    </>
  );
}

export function EditarCosto({ id, clienteId, concepto, monto }: { id: string; clienteId: string; concepto: string; monto: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <LinkEditar onClick={() => setOpen(true)} />
      {open && (
        <Modal titulo="Editar costo" onClose={() => setOpen(false)} onSubmit={editarCosto} textoGuardar="Guardar cambios">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="clienteId" value={clienteId} />
          <input name="concepto" defaultValue={concepto} required style={campo} />
          <input name="monto" defaultValue={String(monto)} inputMode="numeric" required style={campo} />
        </Modal>
      )}
    </>
  );
}

export function EditarPago({ id, clienteId, monto, fecha, medio, cuenta }: { id: string; clienteId: string; monto: number; fecha: string; medio: string; cuenta: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <LinkEditar onClick={() => setOpen(true)} />
      {open && (
        <Modal titulo="Editar pago" onClose={() => setOpen(false)} onSubmit={editarPago} textoGuardar="Guardar cambios">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="clienteId" value={clienteId} />
          <div style={{ display: "flex", gap: 11 }}>
            <input name="monto" defaultValue={String(monto)} inputMode="numeric" required style={{ ...campo, flex: 1 }} />
            <input name="fecha" type="date" defaultValue={fecha} style={{ ...campo, flex: 1 }} />
          </div>
          <div style={{ display: "flex", gap: 11 }}>
            <input name="medio" defaultValue={medio} placeholder="Medio" style={{ ...campo, flex: 1 }} />
            <input name="cuenta" defaultValue={cuenta} placeholder="Cuenta" style={{ ...campo, flex: 1 }} />
          </div>
        </Modal>
      )}
    </>
  );
}
