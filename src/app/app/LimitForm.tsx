"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

export function LimitForm({
  action,
  childId,
  value,
  hint,
}: {
  action: (fd: FormData) => Promise<void>;
  childId: string;
  value: number;
  hint: string;
}) {
  const [v, setV] = useState(value);
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="child_id" value={childId} />
      <label htmlFor="minutes" className="text-[15px] font-medium">เวลาสูงสุดต่อวัน</label>
      <div className="flex items-center gap-3">
        <input id="minutes" name="minutes" type="range" min={10} max={30} step={5} value={v} onChange={(e) => setV(Number(e.target.value))} className="min-h-8 flex-1 accent-brand" />
        <output htmlFor="minutes" className="min-w-[72px] text-right font-display font-semibold tabular-nums">{v} นาที</output>
      </div>
      <span className="hint">{hint}</span>
      <Save dirty={v !== value} />
    </form>
  );
}

function Save({ dirty }: { dirty: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary justify-self-start" disabled={!dirty || pending}>
      {pending ? "กำลังบันทึก…" : dirty ? "บันทึกเวลา" : "บันทึกแล้ว"}
    </button>
  );
}
