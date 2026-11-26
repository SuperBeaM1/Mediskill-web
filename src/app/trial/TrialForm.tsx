"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { bookTrial, type TrialState } from "./actions";

export type OpenSlot = { id: string; dateLabel: string; timeLabel: string; format: "onsite" | "online"; group: string | null; note: string | null; seats: number };

function Err({ id, msg }: { id: string; msg?: string }) {
  return msg ? <span id={id} role="alert" className="text-sm text-err">{msg}</span> : null;
}

export function TrialForm({ slots }: { slots: OpenSlot[] }) {
  const [state, action, pending] = useActionState<TrialState, FormData>(bookTrial, null);
  const v = state?.values;
  const f = state?.fields ?? {};
  const [slot, setSlot] = useState(v?.slot ?? "");

  if (state?.done) {
    return (
      <div role="status" className="grid gap-3 rounded-2xl border-2 border-brand bg-brand-tint p-6">
        <b className="font-display text-xl">จองสำเร็จ</b>
        <p>{state.done}</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/register" className="btn-primary">สมัครบัญชีไว้ก่อน</Link>
          <Link href="/" className="btn-ghost">กลับหน้าแรก</Link>
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return <p className="panel text-soft">ตอนนี้ยังไม่มีรอบทดลองที่เปิดรับ ทักไลน์ @meditskill เพื่อนัดรอบที่สะดวกได้เลย</p>;
  }

  const days = [...new Set(slots.map((s) => s.dateLabel))];

  return (
    <form action={action} noValidate className="grid gap-5">
      {state?.error && <p role="alert" className="rounded-[10px] bg-coral-tint px-4 py-3 text-[15px] text-err">{state.error}</p>}

      <fieldset className="panel">
        <legend className="sr-only">เลือกรอบทดลอง</legend>
        <h2 className="text-lg font-semibold">1. เลือกรอบ</h2>
        <Err id="slot-err" msg={f.slot} />
        <div className="grid gap-4">
          {days.map((d) => (
            <div key={d} className="grid gap-2">
              <b className="font-display text-[15px]">{d}</b>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {slots.filter((s) => s.dateLabel === d).map((s) => {
                  const full = s.seats <= 0;
                  const on = slot === s.id;
                  return (
                    <label
                      key={s.id}
                      className={`flex min-h-16 cursor-pointer items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 transition has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-brand ${full ? "cursor-not-allowed opacity-50" : on ? "border-brand bg-brand-tint" : "border-line bg-surface hover:border-brand"}`}
                    >
                      <input type="radio" name="slot" value={s.id} checked={on} disabled={full} onChange={() => setSlot(s.id)} className="sr-only" />
                      <span className="min-w-0">
                        <b className="block font-display text-lg tabular-nums">{s.timeLabel}</b>
                        <span className="hint block">
                          {s.format === "online" ? "ออนไลน์ Google Meet" : "ที่ศูนย์"}
                          {s.group ? ` · ${s.group}` : " · ทุกวัย"}
                          {s.note ? ` · ${s.note}` : ""}
                        </span>
                      </span>
                      <span className={full ? "pill-miss" : s.seats <= 2 ? "pill-wait" : "pill-ok"}>{full ? "เต็ม" : `ว่าง ${s.seats}`}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <section className="panel">
        <h2 className="text-lg font-semibold">2. ข้อมูลติดต่อ</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="field">
            <label htmlFor="full_name">ชื่อผู้ติดต่อ</label>
            <input id="full_name" name="full_name" autoComplete="name" required maxLength={120} className="input" defaultValue={v?.full_name} aria-invalid={!!f.full_name} aria-describedby="full_name-err" />
            <Err id="full_name-err" msg={f.full_name} />
          </div>
          <div className="field">
            <label htmlFor="phone">เบอร์โทร</label>
            <input id="phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel" required className="input" defaultValue={v?.phone} aria-invalid={!!f.phone} aria-describedby="phone-err" />
            <Err id="phone-err" msg={f.phone} />
          </div>
          <div className="field">
            <label htmlFor="nickname">ชื่อเล่นผู้เรียน</label>
            <input id="nickname" name="nickname" required maxLength={40} className="input" defaultValue={v?.nickname} aria-invalid={!!f.nickname} aria-describedby="nickname-err" />
            <Err id="nickname-err" msg={f.nickname} />
          </div>
          <div className="field">
            <label htmlFor="age">อายุผู้เรียน (ปี)</label>
            <input id="age" name="age" type="number" inputMode="numeric" min={4} max={110} required className="input tabular-nums" defaultValue={v?.age} aria-invalid={!!f.age} aria-describedby="age-err" />
            <Err id="age-err" msg={f.age} />
          </div>
          <div className="field sm:col-span-2">
            <label htmlFor="note">อยากบอกอะไรครู (ไม่บังคับ)</label>
            <textarea id="note" name="note" rows={2} maxLength={500} className="input min-h-16 py-2.5" defaultValue={v?.note} placeholder="เช่น ลูกสมาธิสั้น อยากลองดูก่อน หรืออยากฝึกจดจ่อตอนทำงาน" />
            <Err id="note-err" msg={f.note} />
          </div>
        </div>
        <label htmlFor="consent" className="flex items-start gap-2.5 text-sm text-soft">
          <input id="consent" name="consent" type="checkbox" className="mt-0.5 size-5 flex-none accent-brand" />
          ยินยอมให้ MeditSkill ใช้ชื่อและเบอร์โทรนี้ติดต่อเรื่องคลาสทดลอง ตาม<Link href="/privacy" target="_blank" className="text-brand underline">นโยบายความเป็นส่วนตัว</Link>
        </label>
        <Err id="consent-err" msg={f.consent} />
      </section>

      <button className="btn-primary min-h-14 text-lg sm:justify-self-start sm:px-10" disabled={pending}>{pending ? "กำลังจอง…" : "จองคลาสทดลอง"}</button>
    </form>
  );
}
