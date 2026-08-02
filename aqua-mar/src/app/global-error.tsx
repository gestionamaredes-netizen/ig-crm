"use client";

/** Último recurso si falla el layout raíz. */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="es-AR">
      <body style={{ fontFamily: "system-ui", background: "#F6FAFD", color: "#152238" }}>
        <main
          style={{
            minHeight: "100svh",
            display: "grid",
            placeItems: "center",
            padding: 24,
            textAlign: "center",
          }}
        >
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>Algo no salió como esperábamos.</h1>
            <button
              onClick={reset}
              style={{
                marginTop: 24,
                padding: "14px 32px",
                borderRadius: 18,
                background: "#0058D9",
                color: "#fff",
                fontWeight: 700,
                border: 0,
                cursor: "pointer",
              }}
            >
              Reintentar
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
