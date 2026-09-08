"use client";
import { X } from "lucide-react";

export const campo: React.CSSProperties = {
  width: "100%",
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "10px 12px",
  color: "var(--text)",
  fontSize: 16, // 16px evita el zoom de iOS al enfocar
  outline: "none",
  fontFamily: "inherit",
};

export function Modal({
  titulo,
  onClose,
  onSubmit,
  children,
  textoGuardar = "Guardar",
}: {
  titulo: string;
  onClose: () => void;
  onSubmit: (fd: FormData) => Promise<void>;
  children: React.ReactNode;
  textoGuardar?: string;
}) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(3px)", zIndex: 60, display: "grid", placeItems: "center", padding: 16 }}
    >
      <form
        action={async (fd) => {
          await onSubmit(fd);
          onClose();
        }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: 440, maxWidth: "100%", background: "var(--panel-2)", border: "1px solid var(--border-2)", borderRadius: 18, padding: 22, boxShadow: "0 30px 70px -20px #000" }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
          <b style={{ fontSize: 16, fontWeight: 720 }}>{titulo}</b>
          <button type="button" onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--faint)", cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>{children}</div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 11, padding: "11px 0", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Cancelar
          </button>
          <button type="submit" style={{ flex: 1, background: "var(--accent)", border: "none", color: "#fff", borderRadius: 11, padding: "11px 0", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            {textoGuardar}
          </button>
        </div>
      </form>
    </div>
  );
}

/** Botón de borrar con confirmación (submit de un form con server action). */
export function BotonBorrar({ accion, campos, children = "Borrar", confirmar }: {
  accion: (fd: FormData) => Promise<void>;
  campos: Record<string, string>;
  children?: React.ReactNode;
  confirmar: string;
}) {
  return (
    <form
      action={accion}
      onSubmit={(e) => {
        if (!window.confirm(confirmar)) e.preventDefault();
      }}
      style={{ display: "inline" }}
    >
      {Object.entries(campos).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <button type="submit" style={{ background: "none", border: "none", color: "var(--faint)", cursor: "pointer", fontSize: 11, padding: 0 }}>
        {children}
      </button>
    </form>
  );
}
