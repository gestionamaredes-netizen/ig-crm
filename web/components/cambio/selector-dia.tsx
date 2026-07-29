"use client";
import { useRouter } from "next/navigation";

const boton: React.CSSProperties = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 11,
  width: 38,
  height: 38,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 14,
  fontWeight: 700,
  color: "var(--text)",
  cursor: "pointer",
  flex: "none",
};

/**
 * Suma (o resta) un día a una fecha "YYYY-MM-DD" operando sobre sus
 * componentes con Date.UTC: parsear el string directo con `new Date(iso)`
 * usaría UTC para el parseo pero la zona local para +/- un día en algunos
 * entornos, y correr el día. Acá se arma la fecha en UTC a propósito y se
 * suma en UTC, así que nunca se corre.
 */
function sumarDias(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const fecha = new Date(Date.UTC(y, m - 1, d));
  fecha.setUTCDate(fecha.getUTCDate() + delta);
  return fecha.toISOString().slice(0, 10);
}

export function SelectorDia({ dia }: { dia: string }) {
  const router = useRouter();

  const ir = (nuevaFecha: string) => {
    if (!nuevaFecha) return;
    router.push(`/cambio?dia=${nuevaFecha}`);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button type="button" onClick={() => ir(sumarDias(dia, -1))} aria-label="Día anterior" style={boton}>
        ◀
      </button>
      <input
        type="date"
        value={dia}
        onChange={(e) => ir(e.target.value)}
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 11,
          padding: "9px 12px",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text)",
          height: 38,
        }}
      />
      <button type="button" onClick={() => ir(sumarDias(dia, 1))} aria-label="Día siguiente" style={boton}>
        ▶
      </button>
    </div>
  );
}
