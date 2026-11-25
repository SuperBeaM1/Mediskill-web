/** 6-I bars: previous month (grey) under current month (brand). rows = [label, prev, now] */
export function SixIBars({ rows, label }: { rows: [string, number | null, number | null][]; label: string }) {
  return (
    <div className="grid gap-3" role="img" aria-label={label}>
      {rows.map(([k, prev, now]) => {
        const diff = prev != null && now != null ? now - prev : null;
        return (
          <div key={k} className="grid grid-cols-[44px_1fr_48px] items-center gap-3 tabular-nums">
            <b className="font-display text-[15px] font-semibold">{k}</b>
            <div className="relative h-3.5 overflow-hidden rounded-full bg-bg">
              {prev != null && <span className="absolute inset-y-0 left-0 rounded-full bg-line" style={{ width: `${prev}%` }} />}
              {now != null && <span className="absolute inset-y-0 left-0 rounded-full bg-brand" style={{ width: `${now}%` }} />}
            </div>
            <span className={`text-right text-[13px] font-semibold ${diff != null && diff < 0 ? "text-coral" : "text-brand"}`}>
              {diff == null ? (now ?? "–") : `${diff >= 0 ? "+" : ""}${diff}`}
            </span>
          </div>
        );
      })}
      <div className="mt-1 flex gap-4 text-[13px] text-soft">
        <span><i className="mr-1.5 inline-block size-3 rounded bg-line align-[-1px]" />เดือนก่อน</span>
        <span><i className="mr-1.5 inline-block size-3 rounded bg-brand align-[-1px]" />เดือนนี้</span>
      </div>
    </div>
  );
}
