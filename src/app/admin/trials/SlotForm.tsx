"use client";

import { useActionState } from "react";
import { AGE_GROUP_LABEL, type AgeGroup } from "@/lib/format";
import { createTrialSlot, type SlotState } from "../actions";

export function SlotForm({ today }: { today: string }) {
  const [state, action, pending] = useActionState<SlotState, FormData>(createTrialSlot, null);
  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="field">
          <label htmlFor="date">วันที่</label>
          <input id="date" name="date" type="date" min={today} required className="input" />
        </div>
        <div className="field">
          <label htmlFor="time">เวลาเริ่ม</label>
          <input id="time" name="time" type="time" defaultValue="10:00" required className="input" />
        </div>
        <div className="field">
          <label htmlFor="minutes">ความยาว (นาที)</label>
          <input id="minutes" name="minutes" type="number" min={15} max={180} step={5} defaultValue={60} required className="input tabular-nums" />
        </div>
        <div className="field">
          <label htmlFor="format">รูปแบบ</label>
          <select id="format" name="format" className="input" defaultValue="onsite">
            <option value="onsite">ที่ศูนย์</option>
            <option value="online">ออนไลน์ Google Meet</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="age_group">กลุ่มวัย</label>
          <select id="age_group" name="age_group" className="input" defaultValue="">
            <option value="">ทุกวัย</option>
            {(Object.keys(AGE_GROUP_LABEL) as AgeGroup[]).map((g) => (
              <option key={g} value={g}>{AGE_GROUP_LABEL[g]}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="capacity">ที่นั่ง</label>
          <input id="capacity" name="capacity" type="number" min={1} max={100} defaultValue={6} required className="input tabular-nums" />
        </div>
        <div className="field sm:col-span-3">
          <label htmlFor="note">หมายเหตุที่ผู้จองเห็น (ไม่บังคับ)</label>
          <input id="note" name="note" maxLength={200} className="input" placeholder="เช่น ห้อง Focus 1 หรือ ผู้ปกครองนั่งด้วย" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-primary" disabled={pending}>{pending ? "กำลังเปิดรอบ…" : "เปิดรอบทดลอง"}</button>
        <span role="status" className={`text-sm ${state?.error ? "text-err" : "text-brand"}`}>{state?.error ?? state?.ok}</span>
      </div>
    </form>
  );
}
