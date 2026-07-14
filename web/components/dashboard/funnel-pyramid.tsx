import { funnelSummary as fallback } from "@/lib/funnel";

type Row = { label: string; count: number; color: string };

export function FunnelPyramid({ data }: { data?: Row[] }) {
  const funnelSummary = data && data.length ? data : fallback;
  const n = funnelSummary.length;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {funnelSummary.map((s, i) => {
          const width = 100 - i * (60 / n);
          return (
            <div
              key={s.label}
              style={{
                width: `${width}%`,
                margin: "0 auto",
                height: 30,
                borderRadius: 6,
                background: s.color,
                boxShadow: `0 6px 16px -8px ${s.color}`,
              }}
            />
          );
        })}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 96 }}>
        {funnelSummary.map((s) => (
          <div key={s.label} style={{ height: 30, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <b className="tnum" style={{ fontSize: 14, fontWeight: 720, lineHeight: 1 }}>
              {s.count}
            </b>
            <span style={{ fontSize: 10.5, color: "var(--faint)" }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
