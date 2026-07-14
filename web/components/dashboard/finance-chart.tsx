import { salesSeries, costSeries } from "@/lib/dashboard-data";

const W = 520;
const H = 180;

function path(series: number[]) {
  const max = 100;
  const step = W / (series.length - 1);
  return series.map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(H - (v / max) * H).toFixed(1)}`).join(" ");
}

export function FinanceChart() {
  const salesLine = path(salesSeries);
  const salesArea = `${salesLine} L${W},${H} L0,${H} Z`;
  const costLine = path(costSeries);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: 180, display: "block" }}>
      <defs>
        <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b9dff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#5b9dff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="salesStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5e5ce6" />
          <stop offset="100%" stopColor="#5b9dff" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="0" y1={H * g} x2={W} y2={H * g} stroke="rgba(255,255,255,.05)" strokeWidth="1" />
      ))}
      <path d={salesArea} fill="url(#salesFill)" />
      <path d={salesLine} fill="none" stroke="url(#salesStroke)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <path d={costLine} fill="none" stroke="#b14bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 0" vectorEffect="non-scaling-stroke" opacity="0.85" />
    </svg>
  );
}
