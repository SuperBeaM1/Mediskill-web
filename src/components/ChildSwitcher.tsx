import Link from "next/link";
import type { Child } from "@/lib/data";
import { AGE_GROUP_LABEL, ageOf } from "@/lib/format";

export function ChildSwitcher({ kids, current, base }: { kids: Child[]; current: Child; base: string }) {
  if (kids.length < 2) return <ChildChip k={current} active />;
  return (
    <div role="group" aria-label="เลือกผู้เรียน" className="flex flex-wrap gap-2">
      {kids.map((k) => (
        <Link key={k.id} href={`${base}?child=${k.id}`} aria-current={k.id === current.id ? "true" : undefined} className="no-underline">
          <ChildChip k={k} active={k.id === current.id} />
        </Link>
      ))}
    </div>
  );
}

function ChildChip({ k, active }: { k: Child; active: boolean }) {
  return (
    <span className={`flex min-h-12 items-center gap-2.5 rounded-[10px] border bg-surface py-1.5 pr-3.5 pl-1.5 leading-tight text-ink ${active ? "border-brand ring-3 ring-brand-tint" : "border-line"}`}>
      <span className="grid size-9 flex-none place-items-center rounded-lg bg-brand-tint font-display font-semibold text-brand">{k.nickname.slice(0, 1)}</span>
      <span>
        {k.nickname}
        <small className="block text-xs text-soft">
          {ageOf(k.birth_year)} ปี · {AGE_GROUP_LABEL[k.age_group]}
        </small>
      </span>
    </span>
  );
}

export function PageHead({ title, sub, children }: { title: string; sub: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[clamp(24px,3vw,30px)] font-semibold">{title}</h1>
        <p className="mt-1 text-soft">{sub}</p>
      </div>
      {children}
    </div>
  );
}
