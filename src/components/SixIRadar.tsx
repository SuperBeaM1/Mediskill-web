/** Hexagon radar for 6-I: previous month (dashed grey) under current month (brand fill). Missing values plot at 0. */
export function SixIRadar({ now, prev, label }: { now: (number | null)[]; prev?: (number | null)[]; label: string }) {
  const axes = ["IQ", "EF", "EQ", "AQ", "MQ", "SQ"];
  const C = 150;
  const R = 110;
  const pt = (i: number, v: number) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 3;
    return [C + Math.cos(a) * R * (v / 100), C + Math.sin(a) * R * (v / 100)] as const;
  };
  const poly = (vals: (number | null)[]) => vals.map((v, i) => pt(i, v ?? 0).join(",")).join(" ");

  return (
    <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-[340px]" role="img" aria-label={label}>
      {[25, 50, 75, 100].map((r) => (
        <polygon key={r} points={poly(axes.map(() => r))} fill="none" stroke="var(--line)" strokeWidth="1" />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pt(i, 100);
        return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="var(--line)" strokeWidth="1" />;
      })}
      {prev && <polygon points={poly(prev)} fill="none" stroke="var(--soft)" strokeWidth="1.5" strokeDasharray="4 4" />}
      <polygon points={poly(now)} fill="var(--brand)" fillOpacity="0.18" stroke="var(--brand)" strokeWidth="2.5" strokeLinejoin="round" />
      {now.map((v, i) => {
        const [x, y] = pt(i, v ?? 0);
        return v == null ? null : <circle key={i} cx={x} cy={y} r="4" fill="var(--brand)" />;
      })}
      {axes.map((a, i) => {
        const [x, y] = pt(i, 122);
        return (
          <text key={a} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="var(--ink)" fontSize="14" fontWeight="600" fontFamily="var(--font-display)">
            {a}
          </text>
        );
      })}
    </svg>
  );
}
