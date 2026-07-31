"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Cambio de contraseña self-service: el usuario logueado se cambia SU PROPIA
// contraseña. Corre 100% en el navegador contra Supabase Auth
// (auth.updateUser), así que la contraseña nunca pasa por el servidor de la app
// ni por nadie más — va del teléfono directo a Supabase. Sirve tanto para el
// admin (en /cambio) como para el runner (en /panel): los dos tienen sesión.

const field: React.CSSProperties = {
  width: "100%", background: "var(--card)", border: "1px solid var(--border)",
  borderRadius: 10, padding: "12px 12px", color: "var(--text)",
  // 16px evita el zoom de iOS al enfocar el campo en el celular.
  fontSize: 16, outline: "none", fontFamily: "inherit",
};
const label: React.CSSProperties = { fontSize: 11.5, color: "var(--muted)", display: "block", marginBottom: 5 };
const botonDorado: React.CSSProperties = {
  background: "var(--grad)", color: "#fff", border: 0, borderRadius: 11,
  padding: "10px 18px", fontSize: 13, fontWeight: 650, cursor: "pointer",
};
const botonSecundario: React.CSSProperties = {
  background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11,
  padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)", cursor: "pointer",
  display: "inline-flex", alignItems: "center",
};

const MIN = 6;

export function CambiarPasswordButton({ etiqueta = "Cambiar contraseña" }: { etiqueta?: string }) {
  const [abierto, setAbierto] = useState(false);
  const [nueva, setNueva] = useState("");
  const [repetir, setRepetir] = useState("");
  const [estado, setEstado] = useState<"idle" | "guardando" | "ok">("idle");
  const [error, setError] = useState<string | null>(null);

  const cerrar = () => {
    setAbierto(false);
    setNueva(""); setRepetir(""); setError(null); setEstado("idle");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (estado === "guardando") return;
    setError(null);

    if (nueva.length < MIN) { setError(`La contraseña tiene que tener al menos ${MIN} caracteres.`); return; }
    if (nueva !== repetir) { setError("Las dos contraseñas no coinciden."); return; }

    setEstado("guardando");
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password: nueva });
      if (err) {
        // El mensaje de Supabase viene en inglés; se muestra uno claro.
        setError(
          /should be different/i.test(err.message)
            ? "La contraseña nueva tiene que ser distinta a la actual."
            : "No se pudo cambiar la contraseña. Probá de nuevo.",
        );
        setEstado("idle");
        return;
      }
      setEstado("ok");
    } catch {
      setError("No se pudo conectar con el servidor. Probá de nuevo.");
      setEstado("idle");
    }
  };

  return (
    <>
      <button type="button" onClick={() => setAbierto(true)} style={botonSecundario}>
        {etiqueta}
      </button>

      {abierto && (
        <div
          className="cambio-modal-overlay"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", zIndex: 50, padding: 20 }}
          onClick={() => { if (estado !== "guardando") cerrar(); }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="cambio-modal"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, width: "min(420px,100%)", maxHeight: "90vh", overflowY: "auto" }}
          >
            <h2 style={{ fontSize: 17, fontWeight: 740, margin: "0 0 16px" }}>Cambiar contraseña</h2>

            {estado === "ok" ? (
              <>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text)", margin: "0 0 18px" }}>
                  Listo, tu contraseña se cambió. La próxima vez entrás con la nueva.
                </p>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button type="button" onClick={cerrar} style={botonDorado}>Cerrar</button>
                </div>
              </>
            ) : (
              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                <div>
                  <label style={label}>Nueva contraseña</label>
                  <input
                    type="password" autoComplete="new-password" value={nueva}
                    onChange={(e) => setNueva(e.target.value)} style={field}
                    placeholder={`Al menos ${MIN} caracteres`} required
                  />
                </div>
                <div>
                  <label style={label}>Repetir contraseña</label>
                  <input
                    type="password" autoComplete="new-password" value={repetir}
                    onChange={(e) => setRepetir(e.target.value)} style={field}
                    placeholder="La misma otra vez" required
                  />
                </div>

                {error && <p style={{ color: "var(--warn)", fontSize: 12.5, margin: 0 }}>{error}</p>}

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                  <button type="button" onClick={cerrar} disabled={estado === "guardando"} style={{ ...botonSecundario, opacity: estado === "guardando" ? 0.6 : 1 }}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={estado === "guardando"} style={{ ...botonDorado, padding: "10px 20px", opacity: estado === "guardando" ? 0.6 : 1 }}>
                    {estado === "guardando" ? "Guardando…" : "Guardar"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
