import Link from "next/link";
import { formatearPesos } from "@/lib/formato";

export function Tarjeta({
  titulo,
  accion,
  children,
  className = "",
}: {
  titulo?: string;
  accion?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`min-w-0 rounded-2xl border border-borde bg-white shadow-sm ${className}`}>
      {(titulo || accion) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-borde px-4 py-3">
          {titulo && <h2 className="text-sm font-semibold tracking-tight">{titulo}</h2>}
          {accion}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Kpi({
  etiqueta,
  valor,
  detalle,
  tono = "neutro",
}: {
  etiqueta: string;
  valor: string;
  detalle?: string;
  tono?: "neutro" | "bueno" | "malo";
}) {
  const color =
    tono === "bueno" ? "text-emerald-700" : tono === "malo" ? "text-rose-700" : "text-tinta";
  return (
    <div className="min-w-0 rounded-2xl border border-borde bg-white p-3.5 shadow-sm sm:p-4">
      <p className="text-xs font-medium text-suave">{etiqueta}</p>
      <p className={`tabular mt-1 text-[clamp(1.05rem,4.4vw,1.25rem)] font-semibold tracking-tight ${color}`}>{valor}</p>
      {detalle && <p className="mt-1 text-xs text-suave">{detalle}</p>}
    </div>
  );
}

export function Boton({
  children,
  variante = "primario",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: "primario" | "secundario" | "peligro" }) {
  const estilos = {
    primario: "bg-marea-600 text-white hover:bg-marea-700",
    secundario: "border border-borde bg-white text-tinta hover:bg-marea-50",
    peligro: "border border-rose-200 bg-white text-rose-700 hover:bg-rose-50",
  }[variante];
  return (
    <button
      {...props}
      className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 sm:min-h-10 ${estilos} ${className}`}
    >
      {children}
    </button>
  );
}

export function BotonLink({
  href,
  children,
  variante = "primario",
}: {
  href: string;
  children: React.ReactNode;
  variante?: "primario" | "secundario";
}) {
  const estilos =
    variante === "primario"
      ? "bg-marea-600 text-white hover:bg-marea-700"
      : "border border-borde bg-white text-tinta hover:bg-marea-50";
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition sm:min-h-10 ${estilos}`}
    >
      {children}
    </Link>
  );
}

const claseCampo =
  "block w-full min-w-0 rounded-xl border border-borde bg-white px-3 py-2.5 text-sm outline-none focus:border-marea-400 focus:ring-2 focus:ring-marea-100";

export function Campo({
  etiqueta,
  ayuda,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "children"> & { etiqueta: string; ayuda?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-suave">{etiqueta}</span>
      <input {...props} className={claseCampo} />
      {ayuda && <span className="mt-1 block text-xs text-suave">{ayuda}</span>}
    </label>
  );
}

export function CampoSelect({
  etiqueta,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { etiqueta: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-suave">{etiqueta}</span>
      <select {...props} className={claseCampo}>
        {children}
      </select>
    </label>
  );
}

export function CampoTexto({
  etiqueta,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { etiqueta: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-suave">{etiqueta}</span>
      <textarea {...props} className={claseCampo} />
    </label>
  );
}

const TONOS_ESTADO: Record<string, string> = {
  pendiente: "bg-amber-50 text-amber-800 border-amber-200",
  preparando: "bg-sky-50 text-sky-800 border-sky-200",
  entregado: "bg-emerald-50 text-emerald-800 border-emerald-200",
  cancelado: "bg-slate-100 text-slate-600 border-slate-200",
};

export function Estado({ valor }: { valor: string }) {
  const tono = TONOS_ESTADO[valor] ?? "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span className={`inline-flex shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${tono}`}>
      {valor}
    </span>
  );
}

export function Plata({ centavos, tono = false }: { centavos: number; tono?: boolean }) {
  const color = !tono ? "" : centavos < 0 ? "text-rose-700" : "text-emerald-700";
  return <span className={`tabular ${color}`}>{formatearPesos(centavos)}</span>;
}

export function Vacio({ children }: { children: React.ReactNode }) {
  return <p className="py-8 text-center text-sm text-suave">{children}</p>;
}

export function Aviso({ texto, tipo = "error" }: { texto: string; tipo?: "error" | "ok" }) {
  const estilo =
    tipo === "error" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800";
  return <p className={`rounded-xl border px-3 py-2 text-sm ${estilo}`}>{texto}</p>;
}

/** Las tablas anchas scrollean adentro de su caja, no arrastran la página. */
export function Tabla({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-4 min-w-0 overflow-x-auto px-4">
      <table className="w-full min-w-[520px] border-collapse text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, alinear = "left" }: { children?: React.ReactNode; alinear?: "left" | "right" }) {
  return (
    <th
      className={`border-b border-borde pb-2 text-xs font-medium text-suave ${
        alinear === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  alinear = "left",
  className = "",
}: {
  children?: React.ReactNode;
  alinear?: "left" | "right";
  className?: string;
}) {
  return (
    <td
      className={`border-b border-borde py-2.5 ${alinear === "right" ? "text-right" : "text-left"} ${className}`}
    >
      {children}
    </td>
  );
}
