"use client";

import { useActionState } from "react";
import { FieldError } from "../(auth)/AuthShell";
import { addLearner, type LearnerState } from "./actions";

export function AddLearner({ first = false }: { first?: boolean }) {
  const [state, action, pending] = useActionState<LearnerState, FormData>(addLearner, null);
  const f = state?.fields ?? {};
  const v = state?.values;
  return (
    <form action={action} noValidate className="grid gap-3.5">
      {state?.error && <p role="alert" className="rounded-[10px] bg-coral-tint px-4 py-3 text-[15px] text-err">{state.error}</p>}
      <div className="grid gap-3.5 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="nickname">ชื่อเล่นผู้เรียน</label>
          <input id="nickname" name="nickname" maxLength={40} required className="input" defaultValue={v?.nickname} aria-invalid={!!f.nickname} />
          <FieldError id="nickname-err" msg={f.nickname} />
        </div>
        <div className="field">
          <label htmlFor="age">อายุ (ปี)</label>
          <input id="age" name="age" type="number" inputMode="numeric" min={4} max={110} required className="input tabular-nums" defaultValue={v?.age} aria-invalid={!!f.age} />
          <FieldError id="age-err" msg={f.age} />
        </div>
      </div>
      <span className="hint">เพิ่มตัวเองหรือคนในครอบครัวก็ได้ ระบบจัดกลุ่มเนื้อหาตามวัยให้อัตโนมัติ</span>
      <button className={`btn-primary ${first ? "w-full sm:w-auto sm:min-w-40" : "justify-self-start"}`} disabled={pending}>
        {pending ? "กำลังบันทึก…" : first ? "ไปต่อ" : "เพิ่มผู้เรียน"}
      </button>
    </form>
  );
}
