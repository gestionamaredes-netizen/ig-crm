import Link from "next/link";
import { getDatosCambio, hoyISO } from "@/lib/cambio/datos";
import { ComprobanteCliente } from "@/components/cambio/comprobante-cliente";
import { MobileTopBar } from "@/components/cambio/mobile-topbar";

export const dynamic = "force-dynamic";

// Mismo branding dorado de Gestiones MA que el resto de la caja de cambio.
const GM_ACCENT = "#D9A84E";
const GM_GRAD = "linear-gradient(140deg,#D9A84E,#a9791f)";

type Props = {
  searchParams: Promise<{ cliente?: string }>;
};

export default async function ComprobantePage({ searchParams }: Props) {
  const sp = await searchParams;
  const cliente = String(sp.cliente ?? "");

  const { operaciones } = await getDatosCambio(hoyISO());
  const ops = operaciones.filter((o) => (o.cliente || "(sin cliente)") === cliente);

  return (
    <div
      style={{
        ["--accent" as string]: GM_ACCENT,
        ["--grad" as string]: GM_GRAD,
      }}
    >
      <MobileTopBar />

      <div className="no-print" style={{ padding: "18px 30px 0" }}>
        <Link
          href="/cambio"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 11,
            padding: "10px 16px",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text)",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          ← Volver a Cambio
        </Link>
      </div>

      {cliente && ops.length > 0 ? (
        <ComprobanteCliente cliente={cliente} operaciones={ops} />
      ) : (
        <div
          className="cambio-page"
          style={{ padding: "26px 30px 40px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 560, margin: "0 auto" }}
        >
          <div
            style={{
              background: "var(--glass)",
              backdropFilter: "blur(16px)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: 24,
              textAlign: "center",
            }}
          >
            <h1 style={{ fontSize: 18, fontWeight: 780, margin: "0 0 8px" }}>Sin operaciones para mostrar</h1>
            <p style={{ fontSize: 13.5, color: "var(--muted)", margin: 0 }}>
              {cliente
                ? `No encontramos operaciones para "${cliente}".`
                : "Elegí un cliente desde la caja de cambio para generar su comprobante."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
