import Link from "next/link";
import { MobileTopBar } from "@/components/cambio/mobile-topbar";

// Branding Gestiones MA (dorado), igual que el resto de la caja.
const GM_ACCENT = "#D9A84E";
const GM_GRAD = "linear-gradient(140deg,#D9A84E,#a9791f)";

const panel: React.CSSProperties = {
  background: "var(--glass)",
  backdropFilter: "blur(16px)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: 18,
};

type Paso = { n: string; icono: string; titulo: string; cuerpo: React.ReactNode };

const b = (t: string) => <b style={{ color: GM_ACCENT, fontWeight: 700 }}>{t}</b>;

const pasos: Paso[] = [
  {
    n: "1", icono: "💵", titulo: "Cargar una operación",
    cuerpo: (
      <>Tocá {b("Nueva operación")} y elegí {b("COMPRA")}, {b("VENTA")} o {b("CARGA")} (dólares propios que sumás al
        stock, a un costo que vos ponés). Poné el cliente, el emisor y el receptor, el {b("monto")} y el
        {" "}{b("tipo de cambio")} — el sistema calcula solo los pesos y los dólares. Elegí las cajas y tocá {b("Guardar")}.</>
    ),
  },
  {
    n: "2", icono: "📎", titulo: "Sumar el comprobante",
    cuerpo: (
      <>Adjuntá la {b("foto o el PDF")} de la transferencia. Podés hacerlo al cargar la operación, o después con el
        botón {b("Adjuntar")} en la fila. Para verlo, tocás {b("Ver")}.</>
    ),
  },
  {
    n: "3", icono: "👥", titulo: "Contactos",
    cuerpo: (
      <>¿Cliente, emisor o receptor nuevo? Agregalo con {b("+ nuevo")} sin salir del formulario. Queda guardado para
        la próxima.</>
    ),
  },
  {
    n: "4", icono: "🏃", titulo: "Runners",
    cuerpo: (
      <>En la sección {b("Runners")} cargás las {b("gestiones")} (retiros y transferencias) de cada uno,
        {" "}{b("registrás los pagos")} que les hacés, y ves de un vistazo {b("cuánto se le debe")} a Owen, Zurdo y Capi.</>
    ),
  },
  {
    n: "5", icono: "📊", titulo: "Ver los números y descargar",
    cuerpo: (
      <>Arriba de todo ves el {b("stock de dólares")}, el {b("costo promedio")} y el {b("margen")}. Con
        {" "}{b("Descargar Excel")} bajás todas las operaciones a una planilla.</>
    ),
  },
];

export default function AyudaPage() {
  return (
    <div style={{ ["--accent" as string]: GM_ACCENT, ["--grad" as string]: GM_GRAD }}>
      <MobileTopBar />
      <div className="cambio-page" style={{ padding: "26px 30px 40px", display: "flex", flexDirection: "column", gap: 18, maxWidth: 760, margin: "0 auto" }}>
        <div className="cambio-head" style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 780, letterSpacing: "-.5px", margin: 0 }}>Cómo funciona la caja</h1>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "5px 0 0" }}>Guía rápida para operar el día a día.</p>
          </div>
          <div className="cambio-head-actions" style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <Link
              href="/cambio"
              style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)", display: "inline-flex", alignItems: "center" }}
            >
              ← Volver a la caja
            </Link>
          </div>
        </div>

        {/* Cómo entrar */}
        <div style={{ ...panel, border: "1.5px solid rgba(217,168,78,.5)", background: "linear-gradient(150deg, rgba(217,168,78,.14), rgba(217,168,78,.03))" }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: GM_ACCENT, fontWeight: 800, marginBottom: 14 }}>🔑 CÓMO ENTRAR</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
            {[
              { k: "Sitio web", v: "gestionesma.store", mono: false },
              { k: "Usuario", v: "Capi", mono: true },
              { k: "Contraseña", v: "Capi2020", mono: true },
            ].map((c) => (
              <div key={c.k} style={{ background: "rgba(0,0,0,.25)", border: "1px solid var(--border)", borderRadius: 12, padding: "11px 14px" }}>
                <div style={{ fontSize: 10.5, letterSpacing: 1, color: "var(--muted)", textTransform: "uppercase" }}>{c.k}</div>
                <div style={{ fontSize: 18, fontWeight: 800, marginTop: 3, color: c.mono ? GM_ACCENT : "var(--text)", fontFamily: c.mono ? "ui-monospace,Menlo,Consolas,monospace" : "inherit" }}>{c.v}</div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 13, fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5 }}>
            📱 Entrás igual desde la computadora o el celular. La contraseña va con la <b style={{ color: "var(--text)" }}>C</b> mayúscula.
          </p>
        </div>

        {/* Pasos */}
        {pasos.map((p) => (
          <div key={p.n} style={{ ...panel, display: "flex", gap: 15, alignItems: "flex-start" }}>
            <div style={{ flex: "none", width: 42, height: 42, borderRadius: 12, background: GM_GRAD, color: "#1a1205", display: "grid", placeItems: "center", fontSize: 20, fontWeight: 900 }}>
              {p.n}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: 16.5, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span>{p.icono}</span>{p.titulo}
              </h2>
              <p style={{ margin: "7px 0 0", fontSize: 14, lineHeight: 1.6, color: "var(--text)" }}>{p.cuerpo}</p>
            </div>
          </div>
        ))}

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", marginTop: 6 }}>
          Cualquier duda, escribile al <b style={{ color: GM_ACCENT }}>encargado</b>.
        </p>
      </div>
    </div>
  );
}
