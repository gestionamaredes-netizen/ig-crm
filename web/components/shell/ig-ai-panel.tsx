"use client";
import { useState } from "react";
import { Send } from "lucide-react";

const answers: Record<string, string> = {
  "¿Qué cliente hace más de 30 días que no compra?":
    "Detecté 3 clientes inactivos +30 días: Loteo Las Lomas (Premoldeados), cliente USDT recurrente (Gestiones) y Mayorista accesorios (NYPRO).",
  "Generá una campaña para NYPRO":
    "Campaña “Upgrade Tech Julio”: 3 piezas para IG + copy, retargeting 18-35. (maqueta — la IA real llega en Fase 4)",
  "¿Cuántas ventas hubo este mes?": "$52.840.000 en las 4 empresas (▲24,3%).",
};
const suggestions = Object.keys(answers);

export function IgAiPanel() {
  const [log, setLog] = useState<{ q: string; a: string }[]>([]);
  const ask = (q: string) => setLog((l) => [...l, { q, a: answers[q] ?? "Lo estoy pensando…" }]);

  return (
    <div
      style={{
        background: "var(--glass)",
        backdropFilter: "blur(16px)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: 20,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <b style={{ fontSize: 15, fontWeight: 720 }}>IG AI</b>
          <div style={{ fontSize: 11.5, color: "var(--faint)" }}>Asistente inteligente</div>
        </div>
        <span
          style={{
            fontSize: 9.5,
            fontWeight: 800,
            letterSpacing: "1px",
            padding: "3px 8px",
            borderRadius: 20,
            background: "rgba(var(--accent-rgb),.18)",
            color: "var(--accent)",
          }}
        >
          BETA
        </span>
      </div>

      {/* Orbe */}
      <div style={{ display: "grid", placeItems: "center", padding: "22px 0 16px" }}>
        <div style={{ position: "relative", width: 118, height: 118, display: "grid", placeItems: "center" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "conic-gradient(from 0deg,var(--g1),var(--g2),var(--g3),var(--g4),var(--g5),var(--g1))",
              filter: "blur(2px)",
              animation: "orbspin 8s linear infinite",
            }}
          />
          <div style={{ position: "absolute", inset: 5, borderRadius: "50%", background: "var(--card)" }} />
          <div
            style={{
              position: "absolute",
              inset: -8,
              borderRadius: "50%",
              background: "var(--grad)",
              opacity: 0.25,
              filter: "blur(22px)",
            }}
          />
          <span style={{ position: "relative", fontSize: 34, fontWeight: 800, letterSpacing: "-2px" }}>
            i<span className="gt">G</span>
          </span>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "0 6px 16px" }}>
        <b style={{ fontSize: 14 }}>¿En qué puedo ayudarte hoy?</b>
        <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, margin: "7px 0 0" }}>
          Puedo analizar datos, crear campañas, responder clientes y mucho más.
        </p>
      </div>

      {log.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              style={{
                textAlign: "left",
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                borderRadius: 11,
                padding: "9px 12px",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14, maxHeight: 220, overflowY: "auto" }}>
          {log.map((e, i) => (
            <div key={i}>
              <div
                style={{
                  background: "rgba(var(--accent-rgb),.16)",
                  borderRadius: 12,
                  borderTopRightRadius: 4,
                  padding: "10px 12px",
                  fontSize: 12,
                  marginLeft: 24,
                }}
              >
                {e.q}
              </div>
              <div
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  borderTopLeftRadius: 4,
                  padding: "10px 12px",
                  fontSize: 12,
                  lineHeight: 1.5,
                  marginTop: 6,
                }}
              >
                {e.a}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "auto", display: "flex", gap: 8, alignItems: "center" }}>
        <input
          placeholder="Escribí tu consulta..."
          style={{
            flex: 1,
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "11px 13px",
            color: "var(--text)",
            fontSize: 12.5,
            outline: "none",
          }}
        />
        <button
          aria-label="Enviar"
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            border: "none",
            background: "var(--grad)",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            flex: "none",
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
