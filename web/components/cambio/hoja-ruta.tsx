"use client";
import { useState } from "react";

/**
 * Botón "Hoja de ruta" de un runner. El texto ya viene armado desde el server
 * (`textoHojaRuta`), con SOLO datos operativos (banco, titular, DNI, CBU/alias)
 * y sin usuario ni clave. Acá solo se muestra para copiar o abrir WhatsApp; el
 * envío lo hace la persona.
 */
export function HojaRutaButton({ runner, texto }: { runner: string; texto: string }) {
  const [abierto, setAbierto] = useState(false);
  const [valor, setValor] = useState(texto);
  const [tel, setTel] = useState("");
  const [aviso, setAviso] = useState("");

  const abrir = () => { setValor(texto); setAviso(""); setAbierto(true); };

  const copiar = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(valor);
      } else {
        const ta = document.createElement("textarea");
        ta.value = valor; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
      }
      setAviso("✓ Copiado. Pegalo en el chat del runner.");
    } catch {
      setAviso("No se pudo copiar automáticamente; seleccioná el texto y copialo a mano.");
    }
  };

  const abrirWhatsapp = () => {
    const num = (tel || "").replace(/\D/g, "");
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(valor)}`, "_blank", "noopener");
    setAviso("Se abrió WhatsApp con el texto. Revisalo y enviá vos.");
  };

  return (
    <>
      <button
        type="button"
        onClick={abrir}
        style={{ width: "100%", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 9, padding: "7px 10px", fontSize: 12, fontWeight: 600, color: "var(--text)", cursor: "pointer" }}
      >
        Hoja de ruta
      </button>

      {abierto && (
        <div
          className="cambio-modal-overlay"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", zIndex: 50, padding: 20 }}
          onClick={() => setAbierto(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="cambio-modal"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, width: "min(560px,100%)", maxHeight: "90vh", overflowY: "auto" }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ fontSize: 17, fontWeight: 740, margin: 0 }}>Hoja de ruta · {runner}</h2>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                style={{ marginLeft: "auto", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "6px 12px", fontSize: 13, color: "var(--text)", cursor: "pointer" }}
              >
                Cerrar
              </button>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 14px" }}>
              Cuentas asignadas con datos operativos. No incluye usuario ni clave.
            </p>

            <textarea
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              rows={16}
              style={{ width: "100%", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: 12, fontSize: 13, lineHeight: 1.5, color: "var(--text)", resize: "vertical", fontFamily: "inherit" }}
            />

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              <button
                type="button"
                onClick={copiar}
                style={{ background: "var(--grad)", color: "#fff", border: 0, borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 650, cursor: "pointer" }}
              >
                Copiar texto
              </button>
              <input
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                placeholder="Nº WhatsApp del runner (opcional)"
                style={{ flex: 1, minWidth: 200, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 12px", fontSize: 13, color: "var(--text)" }}
              />
              <button
                type="button"
                onClick={abrirWhatsapp}
                style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)", cursor: "pointer" }}
              >
                Abrir en WhatsApp
              </button>
            </div>

            {aviso && <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "12px 0 0" }}>{aviso}</p>}
          </div>
        </div>
      )}
    </>
  );
}
