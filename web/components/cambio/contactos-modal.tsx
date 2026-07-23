"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ContactoAdmin } from "@/lib/cambio/datos";
import { createExchangeClient, createExchangePerson, setContactoActivo } from "@/app/(app)/cambio/contactos-actions";

type Props = { clientes: ContactoAdmin[]; personas: ContactoAdmin[] };

const field: React.CSSProperties = {
  flex: 1, background: "var(--card)", border: "1px solid var(--border)",
  borderRadius: 9, padding: "8px 10px", fontSize: 13, color: "var(--text)",
};

function Lista({
  titulo,
  items,
  tabla,
  onCrear,
}: {
  titulo: string;
  items: ContactoAdmin[];
  tabla: "cliente" | "persona";
  onCrear: (nombre: string) => ReturnType<typeof createExchangeClient>;
}) {
  const router = useRouter();
  const [lista, setLista] = useState<ContactoAdmin[]>(items);
  const [nuevo, setNuevo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const agregar = async () => {
    if (ocupado || nuevo.trim() === "") return;
    setOcupado(true);
    setError(null);
    try {
      const r = await onCrear(nuevo.trim());
      if (r.ok) {
        setLista((prev) => [...prev, { id: r.id, nombre: r.nombre, activo: true }].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        setNuevo("");
        router.refresh();
      } else {
        setError(r.error);
      }
    } catch {
      // La action puede rechazar (corte de red, action ID viejo tras un
      // redeploy) en vez de devolver {ok:false}. Sin este catch, `ocupado`
      // quedaba en true para siempre y el botón se trababa.
      setError("No se pudo conectar. Probá de nuevo.");
    } finally {
      setOcupado(false);
    }
  };

  const toggle = async (c: ContactoAdmin) => {
    setError(null);
    try {
      const r = await setContactoActivo(tabla, c.id, !c.activo);
      if (r.ok) {
        setLista((prev) => prev.map((x) => (x.id === c.id ? { ...x, activo: !x.activo } : x)));
        router.refresh();
      } else {
        setError(r.error);
      }
    } catch {
      setError("No se pudo conectar. Probá de nuevo.");
    }
  };

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 10px" }}>{titulo}</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && agregar()}
          placeholder="Agregar…"
          style={field}
        />
        <button
          type="button"
          onClick={agregar}
          disabled={ocupado}
          style={{ background: "var(--grad)", color: "#fff", border: 0, borderRadius: 9, padding: "0 14px", fontSize: 13, fontWeight: 650, cursor: "pointer" }}
        >
          +
        </button>
      </div>
      {error && <p style={{ color: "var(--warn)", fontSize: 11.5, margin: "0 0 8px" }}>{error}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 260, overflowY: "auto" }}>
        {lista.length === 0 && <p style={{ fontSize: 12.5, color: "var(--muted)", margin: 0 }}>Todavía no hay.</p>}
        {lista.map((c) => (
          <div
            key={c.id}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "7px 4px",
              borderBottom: "1px solid var(--border)", opacity: c.activo ? 1 : 0.45,
            }}
          >
            <span style={{ fontSize: 13, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {c.nombre}
            </span>
            <button
              type="button"
              onClick={() => toggle(c)}
              style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "3px 9px", fontSize: 11.5, color: "var(--muted)", cursor: "pointer" }}
            >
              {c.activo ? "Desactivar" : "Reactivar"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContactosButton({ clientes, personas }: Props) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)", cursor: "pointer" }}
      >
        Contactos
      </button>
      {abierto && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", zIndex: 50, padding: 20 }}
          onClick={() => setAbierto(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, width: "min(680px,100%)", maxHeight: "90vh", overflowY: "auto" }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ fontSize: 17, fontWeight: 740, margin: 0 }}>Contactos</h2>
              <button
                onClick={() => setAbierto(false)}
                style={{ marginLeft: "auto", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "6px 12px", fontSize: 13, color: "var(--text)", cursor: "pointer" }}
              >
                Cerrar
              </button>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 18px" }}>
              Desactivar saca el contacto del buscador pero no borra las operaciones que ya lo usan.
            </p>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <Lista titulo="Clientes" items={clientes} tabla="cliente" onCrear={createExchangeClient} />
              <Lista titulo="Emisores / receptores" items={personas} tabla="persona" onCrear={createExchangePerson} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
