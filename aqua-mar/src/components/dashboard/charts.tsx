"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { SeriesPoint, InquiriesPoint } from "@/dashboard/types";
import { EmptyState } from "./widgets";

const BLUE = "#0058D9";
const TURQ = "#00C9D8";
const GRID = "#E6EDF4";

/** Ventas (o pedidos) de los últimos 30 días. */
export function SalesAreaChart({ data }: { data: SeriesPoint[] }) {
  if (data.length === 0) {
    return <EmptyState text="Cuando se registren pedidos, el gráfico aparece acá." />;
  }
  return (
    <div className="w-full min-w-0 overflow-hidden">
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="ventasFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BLUE} stopOpacity={0.25} />
            <stop offset="100%" stopColor={BLUE} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} interval={4} />
        <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
        <Tooltip cursor={{ stroke: TURQ }} />
        <Area type="monotone" dataKey="value" name="Pedidos" stroke={BLUE} strokeWidth={2.5} fill="url(#ventasFill)" />
      </AreaChart>
    </ResponsiveContainer>
    </div>
  );
}

/** Consultas minoristas vs mayoristas por día. */
export function InquiriesBarChart({ data }: { data: InquiriesPoint[] }) {
  if (data.length === 0) {
    return <EmptyState text="Cuando haya consultas registradas, se comparan acá." />;
  }
  return (
    <div className="w-full min-w-0 overflow-hidden">
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
        <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
        <Tooltip cursor={{ fill: "rgba(0,88,217,0.05)" }} />
        <Bar dataKey="minoristas" name="Minoristas" fill={BLUE} radius={[6, 6, 0, 0]} />
        <Bar dataKey="mayoristas" name="Mayoristas" fill={TURQ} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
}

/** Participación por presentación (donut). */
export function ShareDonut({ data }: { data: SeriesPoint[] }) {
  const valid = data.filter((d) => d.value > 0);
  if (valid.length === 0) {
    return <EmptyState compact text="Todavía no hay consultas por producto." />;
  }
  return (
    <div className="w-full min-w-0 overflow-hidden">
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={valid} dataKey="value" nameKey="label" innerRadius={55} outerRadius={80} paddingAngle={4}>
          {valid.map((_, i) => (
            <Cell key={i} fill={[BLUE, TURQ, "#003E8A", "#FDB813"][i % 4]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
    </div>
  );
}

/** Embudo comercial como barras horizontales proporcionales. */
export function FunnelList({ data }: { data: SeriesPoint[] }) {
  if (data.length === 0) {
    return <EmptyState compact text="El embudo se construye con los eventos de la web." />;
  }
  const max = Math.max(...data.map((d) => d.value));
  return (
    <ol className="grid gap-2.5">
      {data.map((step, i) => (
        <li key={step.label}>
          <div className="mb-1 flex items-center justify-between text-xs font-bold">
            <span className="text-ink dark:text-white/85">{step.label}</span>
            <span className="tabular-nums text-ink-soft dark:text-white/50">
              {step.value.toLocaleString("es-AR")}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-mist dark:bg-white/10">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(6, (step.value / max) * 100)}%`,
                background: `linear-gradient(90deg, ${BLUE}, ${i >= 2 ? TURQ : BLUE})`,
              }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
