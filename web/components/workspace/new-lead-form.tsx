"use client";
import { useState, useRef } from "react";
import { Plus, X } from "lucide-react";
import { createLead } from "@/app/(app)/empresas/[slug]/actions";

type StageOpt = { id: string; name: string };

export function NewLeadButton({ slug, stages, accent }: { slug: string; stages: StageOpt[]; accent: string }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const field: React.CSSProperties = {
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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ display: "inline-flex", alignItems: "center", gap: 7, background: accent, color: "#fff", border: "none", borderRadius: 10, padding: "9px 14px", fontSize: 12.5, fontWeight: 650, cursor: "pointer" }}
      >
        <Plus size={15} /> Nuevo lead
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(3px)", zIndex: 50, display: "grid", placeItems: "center", padding: 20 }}
        >
          <form
            ref={formRef}
            action={async (fd) => {
              await createLead(fd);
              setOpen(false);
            }}
            onClick={(e) => e.stopPropagation()}
            style={{ width: 440, maxWidth: "100%", background: "var(--panel-2)", border: "1px solid var(--border-2)", borderRadius: 18, padding: 22, boxShadow: "0 30px 70px -20px #000" }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
              <b style={{ fontSize: 16, fontWeight: 720 }}>Nuevo lead</b>
              <button type="button" onClick={() => setOpen(false)} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--faint)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <input type="hidden" name="slug" value={slug} />
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              <input name="name" placeholder="Nombre del lead / cliente" required style={field} />
              <input name="description" placeholder="Descripción (ej: 40 placas premoldeadas)" style={field} />
              <div style={{ display: "flex", gap: 11 }}>
                <input name="value" placeholder="Valor ($)" inputMode="numeric" style={{ ...field, flex: 1 }} />
                <select name="channel" style={{ ...field, flex: 1 }} defaultValue="wa">
                  <option value="ig">Instagram</option>
                  <option value="wa">WhatsApp</option>
                  <option value="web">Web</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <select name="stageId" style={field} defaultValue={stages[0]?.id}>
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    Etapa: {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button type="button" onClick={() => setOpen(false)} style={{ flex: 1, background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 11, padding: "11px 0", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Cancelar
              </button>
              <button type="submit" style={{ flex: 1, background: accent, border: "none", color: "#fff", borderRadius: 11, padding: "11px 0", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Guardar lead
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
