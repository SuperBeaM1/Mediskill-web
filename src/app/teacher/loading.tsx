export default function Loading() {
  return (
    <div className="grid gap-5" aria-busy="true" aria-label="กำลังโหลด">
      <div className="h-16 w-64 animate-pulse rounded-xl bg-line/60" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-line/60" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-line/60" />
    </div>
  );
}
