"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { crearCliente } from "@/app/(app)/cobros/actions";
import { Modal, campo } from "./ui";

export function BotonNuevoCliente() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--accent)", color: "#fff", border: "none", borderRadius: 10, padding: "9px 14px", fontSize: 12.5, fontWeight: 650, cursor: "pointer" }}
      >
        <Plus size={15} /> Nuevo cliente
      </button>
      {open && (
        <Modal titulo="Nuevo cliente" onClose={() => setOpen(false)} onSubmit={crearCliente}>
          <input name="nombre" placeholder="Nombre del cliente" required style={campo} />
          <select name="tipo" defaultValue="unico" style={campo}>
            <option value="unico">Trabajo único</option>
            <option value="mensual">Mensual</option>
          </select>
          <input name="notas" placeholder="Notas (opcional)" style={campo} />
        </Modal>
      )}
    </>
  );
}
