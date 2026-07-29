import Link from "next/link";
import { getDatosCambio, getClientesParaOperacion, getCajasParaOperacion, getPersonasParaOperacion, getContactos, hoyISO } from "@/lib/cambio/datos";
import { formatearPesos } from "@/lib/formato";
import { TablaOperaciones } from "@/components/cambio/tabla-operaciones";
import { Rankings } from "@/components/cambio/rankings";
import { NuevaOperacionButton } from "@/components/cambio/nueva-operacion-form";
import { ContactosButton } from "@/components/cambio/contactos-modal";
import { MobileTopBar } from "@/components/cambio/mobile-topbar";

export const dynamic = "force-dynamic";

// Branding Gestiones MA (dorado). Los valores son los de lib/companies.ts,
// slug "gestiones". Se aplican como override de las CSS vars sobre esta
// pantalla: la caja es una herramienta de Gestiones MA, así que su acento y
// sus botones van en dorado en vez del violeta general del CRM.
const GM_ACCENT = "#D9A84E";
const GM_GRAD = "linear-gradient(140deg,#D9A84E,#a9791f)";

const panel: React.CSSProperties = {
  background: "var(--glass)",
  backdropFilter: "blur(16px)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: 20,
};

export default async function CambioPage() {
  const hoy = hoyISO();
  const [{ operaciones, saldos, resumen, clientes: rankingDeClientes, personas }, clientes, cajas, personasAlta, contactos] =
    await Promise.all([
      getDatosCambio(hoy),
      getClientesParaOperacion(),
      getCajasParaOperacion(),
      getPersonasParaOperacion(),
      getContactos(),
    ]);

  // Stock de pesos: la plata en pesos que hay en la caja, sumando los saldos
  // de las cajas de pesos (Pesos Físico + Pesos Digital). Sale de los mismos
  // saldos ya calculados, no de una cuenta nueva.
  const stockPesos = saldos.filter((s) => s.moneda === "ARS").reduce((acc, s) => acc + s.saldo, 0);
  // Cuánto de los dólares está en USDT: el saldo de la caja USDT. USDT se
  // trata 1:1 con el dólar, así que ya cuenta dentro del stock de dólares;
  // este KPI muestra aparte la porción que quedó en cripto.
  const stockUsdt = saldos
    .filter((s) => s.nombre.trim().toUpperCase() === "USDT")
    .reduce((acc, s) => acc + s.saldo, 0);

  const kpis = [
    { label: "Stock de dólares", valor: resumen.stockUsd.toLocaleString("es-AR", { maximumFractionDigits: 2 }) },
    { label: "Stock de pesos", valor: formatearPesos(stockPesos) },
    { label: "Stock de USDT", valor: `USDT ${stockUsdt.toLocaleString("es-AR", { maximumFractionDigits: 2 })}` },
    { label: "Costo promedio", valor: formatearPesos(resumen.costoPromedio) },
    { label: "Margen del mes", valor: formatearPesos(resumen.margenDelMes) },
    { label: "Margen acumulado", valor: formatearPesos(resumen.margenTotal) },
    { label: "Comisiones (uso de cuenta)", valor: formatearPesos(resumen.comisiones) },
  ];

  return (
    <div
      style={{
        ["--accent" as string]: GM_ACCENT,
        ["--grad" as string]: GM_GRAD,
      }}
    >
      <MobileTopBar />
      <div
        className="cambio-page"
        style={{
          padding: "26px 30px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
      <div className="cambio-head" style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 780, letterSpacing: "-.5px", margin: 0 }}>Cambio</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "5px 0 0" }}>
            Compra y venta de dólares de Gestiones MA.
          </p>
        </div>
        <div className="cambio-head-actions" style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <Link
            href="/cambio/ayuda"
            title="Cómo funciona la plataforma"
            style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)", display: "inline-flex", alignItems: "center" }}
          >
            Ayuda
          </Link>
          <ContactosButton clientes={contactos.clientes} personas={contactos.personas} />
          <Link
            href="/cambio/runners"
            style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)", display: "inline-flex", alignItems: "center" }}
          >
            Runners
          </Link>
          <Link
            href="/cambio/celulares"
            style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)", display: "inline-flex", alignItems: "center" }}
          >
            Celulares
          </Link>
          {/* Sin prefetch={false}, Next.js prefetchearía este route handler al entrar en viewport/hover,
              ejecutando la lectura completa de Supabase sin que el usuario haya hecho clic. */}
          <Link
            href="/cambio/export"
            prefetch={false}
            style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)", display: "inline-flex", alignItems: "center" }}
          >
            Descargar Excel
          </Link>
          <NuevaOperacionButton clientes={clientes} personas={personasAlta} cajas={cajas} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ ...panel, padding: "16px 18px" }}>
            <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{k.label}</div>
            <b className="tnum" style={{ fontSize: 23, fontWeight: 780, letterSpacing: "-.6px", display: "block", marginTop: 8 }}>
              {k.valor}
            </b>
          </div>
        ))}
      </div>

      <div style={panel}>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px" }}>Cajas</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
          {saldos.map((s) => (
            <div key={s.id}>
              <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{s.nombre}</div>
              {/* Caja en descubierto = falta cargar una operación o hay plata mal imputada. Se marca en vez de disimularse. */}
              <b
                className="tnum"
                style={{ fontSize: 16, display: "block", marginTop: 4, color: s.saldo < 0 ? "var(--warn)" : undefined }}
              >
                {s.moneda === "ARS"
                  ? formatearPesos(s.saldo)
                  : `USD ${s.saldo.toLocaleString("es-AR", { maximumFractionDigits: 2 })}`}
              </b>
            </div>
          ))}
        </div>
      </div>

      <div style={panel}>
        <Rankings clientes={rankingDeClientes} personas={personas} />
      </div>

      <div style={panel}>
        <TablaOperaciones filas={operaciones} clientes={clientes} personas={personasAlta} cajas={cajas} />
      </div>
      </div>
    </div>
  );
}
