"use client";

import { useActionState } from "react";
import { submitSlip } from "../actions";

export function SlipForm({ paymentId }: { paymentId: string }) {
  const [state, action, pending] = useActionState(submitSlip, null);
  const inputId = `slip-${paymentId}`;
  return (
    <form action={action} className="grid gap-2.5">
      <input type="hidden" name="payment_id" value={paymentId} />
      <label htmlFor={inputId} className="text-[15px] font-medium">แนบสลิปโอนเงิน</label>
      <input id={inputId} name="slip" type="file" accept="image/jpeg,image/png,image/webp" required className="max-w-full text-sm text-soft file:mr-3 file:min-h-10 file:cursor-pointer file:rounded-lg file:border file:border-line file:bg-surface file:px-3 file:text-ink" />
      <span className="hint">JPG, PNG หรือ WEBP ไม่เกิน 5 MB</span>
      {state?.error && <p role="alert" className="text-sm text-err">{state.error}</p>}
      {state?.ok && <p role="status" className="text-sm text-brand">ส่งสลิปแล้ว ทีมงานจะตรวจภายใน 1 วันทำการ</p>}
      <button type="submit" className="btn-primary justify-self-start" disabled={pending}>
        {pending ? "กำลังส่ง…" : "แจ้งชำระเงิน"}
      </button>
    </form>
  );
}
