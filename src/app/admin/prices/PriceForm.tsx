"use client";

import { useActionState } from "react";
import { setPrice, type PriceState } from "../actions";

export function PriceForm({ kind, itemKey, name, sub, price }: { kind: "course" | "package"; itemKey: string; name: string; sub: string; price: number }) {
  const [state, action, pending] = useActionState<PriceState, FormData>(setPrice, {});
  const id = `price-${itemKey}`;
  return (
    <form action={action} className="grid gap-3 border-t border-line py-4 first:border-t-0 sm:grid-cols-[1fr_200px_auto] sm:items-end">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="key" value={itemKey} />
      <div className="min-w-0">
        <label htmlFor={id} className="block font-medium">{name}</label>
        <span className="hint">{sub}</span>
      </div>
      <div className="relative">
        <input id={id} name="price" type="number" inputMode="numeric" min={0} max={1000000} step={1} defaultValue={price} required className="input pr-12 tabular-nums" />
        <span className="pointer-events-none absolute inset-y-0 right-3.5 grid place-items-center text-sm text-soft">บาท</span>
      </div>
      <div className="flex items-center gap-3">
        <button className="btn-primary" disabled={pending}>{pending ? "กำลังบันทึก…" : "บันทึก"}</button>
        <span role="status" className={`text-sm ${state.error ? "text-err" : "text-brand"}`}>{state.error ?? state.ok}</span>
      </div>
    </form>
  );
}
