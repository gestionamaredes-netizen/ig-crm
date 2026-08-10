import { franjaTransmision, programas } from "@/lib/transmisiones";

const panel: React.CSSProperties = {
  background: "var(--glass)",
  backdropFilter: "blur(16px)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: 20,
};

export default function TransmisionesPage() {
  const datos = [
    { label: "Franja", valor: franjaTransmision.franja, nota: franjaTransmision.bajada },
    { label: "Estudio", valor: franjaTransmision.estudio, nota: franjaTransmision.ubicacionEstudio },
    {
      label: "Canal",
      valor: `${franjaTransmision.plataforma} — ${franjaTransmision.canal}`,
      nota: franjaTransmision.ubicacionCanal,
    },
  ];

  return (
    <div style={{ padding: "26px 30px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 780, letterSpacing: "-.5px", margin: 0 }}>Transmisiones</h1>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "5px 0 0" }}>
          Programación en vivo de los {franjaTransmision.dia.toLowerCase()}, con salida desde el oeste del conurbano.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
        {datos.map((d) => (
          <div key={d.label} style={{ ...panel, padding: "16px 18px" }}>
            <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{d.label}</div>
            <b style={{ fontSize: 16, fontWeight: 720, letterSpacing: "-.3px", display: "block", marginTop: 8 }}>
              {d.valor}
            </b>
            <span style={{ fontSize: 12, color: "var(--faint)" }}>{d.nota}</span>
          </div>
        ))}
      </div>

      <div>
        <h2 style={{ fontSize: 15, fontWeight: 720, margin: "0 0 12px" }}>Programas</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
          {programas.map((p) => (
            <div key={p.slug} style={{ ...panel, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: p.color }} />
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 11,
                    background: p.color,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 13,
                    fontWeight: 750,
                    color: "#0b0b0d",
                    flex: "none",
                  }}
                >
                  {p.init}
                </span>
                <div>
                  <b style={{ fontSize: 15, fontWeight: 720, display: "block" }}>{p.nombre}</b>
                  <span style={{ fontSize: 11.5, color: "var(--muted)" }}>{p.categoria}</span>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.55, margin: "14px 0 0" }}>
                {p.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
