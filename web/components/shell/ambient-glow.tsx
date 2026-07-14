export function AmbientGlow() {
  const base: React.CSSProperties = {
    position: "fixed",
    borderRadius: "50%",
    filter: "blur(120px)",
    pointerEvents: "none",
    zIndex: 0,
  };
  return (
    <>
      <div style={{ ...base, width: 520, height: 520, background: "var(--g1)", top: -180, left: 90, opacity: 0.16 }} />
      <div style={{ ...base, width: 440, height: 440, background: "var(--g2)", top: -90, right: 260, opacity: 0.12 }} />
      <div style={{ ...base, width: 520, height: 520, background: "var(--g3)", bottom: -280, right: 160, opacity: 0.09 }} />
    </>
  );
}
