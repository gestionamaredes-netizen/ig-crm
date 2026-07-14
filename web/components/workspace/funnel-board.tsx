import { funnelStages, type Lead } from "@/lib/funnel";

export function FunnelBoard({ leads }: { leads: Lead[] }) {
  return (
    <div style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: "minmax(190px,1fr)", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
      {funnelStages.map((st) => {
        const items = leads.filter((l) => l.stage === st.key);
        return (
          <div key={st.key} style={{ background: "rgba(255,255,255,.02)", border: "1px solid var(--border)", borderRadius: 14, padding: 11, minHeight: 150 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 4px 12px", fontSize: 11.5, fontWeight: 650, color: "var(--muted)" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: st.color, flex: "none" }} />
              {st.label}
              <span style={{ marginLeft: "auto", fontSize: 10.5, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: "0 7px", color: "var(--faint)" }}>{items.length}</span>
            </div>
            {items.length === 0 && <div style={{ fontSize: 10.5, color: "var(--faint)", padding: "6px 4px" }}>—</div>}
            {items.map((l, i) => (
              <div key={i} className="hoverable" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: 11, marginBottom: 9 }}>
                <b style={{ fontSize: 12, fontWeight: 620, display: "block", letterSpacing: "-.1px" }}>{l.name}</b>
                <div style={{ fontSize: 10.5, color: "var(--faint)", marginTop: 3, lineHeight: 1.4 }}>{l.desc}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 9 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ok)" }}>{l.value}</span>
                  <span style={{ marginLeft: "auto", width: 20, height: 20, borderRadius: "50%", background: "var(--card-2)", border: "1px solid var(--border)", fontSize: 9, display: "grid", placeItems: "center", color: "var(--muted)", fontWeight: 700 }}>{l.who}</span>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
