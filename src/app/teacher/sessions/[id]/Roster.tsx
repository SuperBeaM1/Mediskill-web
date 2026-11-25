"use client";

import { useActionState, useState } from "react";
import { saveAttendance, type AttendanceState } from "../../actions";

export type RosterRow = {
  id: string;
  nickname: string;
  group: string;
  leave: boolean;
  present: boolean | null;
  focus: number | null;
  note: string | null;
};

export function Roster({ sessionId, rows }: { sessionId: string; rows: RosterRow[] }) {
  const [state, action, pending] = useActionState<AttendanceState, FormData>(saveAttendance, null);
  const [status, setStatus] = useState<Record<string, string>>(() =>
    Object.fromEntries(rows.map((r) => [r.id, r.present == null ? (r.leave ? "absent" : "") : r.present ? "present" : "absent"])),
  );
  const [focus, setFocus] = useState<Record<string, number>>(() => Object.fromEntries(rows.map((r) => [r.id, r.focus ?? 70])));
  const presentCount = Object.values(status).filter((s) => s === "present").length;

  function markAll() {
    setStatus(Object.fromEntries(rows.map((r) => [r.id, r.leave ? "absent" : "present"])));
  }

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="session_id" value={sessionId} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[15px]">มาเรียน <b className="tabular-nums">{presentCount}</b> จาก {rows.length} คน</p>
        <button type="button" onClick={markAll} className="btn-ghost min-h-10 text-sm">มาครบทุกคน (ยกเว้นคนลา)</button>
      </div>

      <ul className="grid gap-3">
        {rows.map((r) => {
          const s = status[r.id] ?? "";
          return (
            <li key={r.id} className="grid gap-3 rounded-xl border border-line bg-surface p-4">
              <input type="hidden" name="child" value={r.id} />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-10 flex-none place-items-center rounded-lg bg-brand-tint font-display font-semibold text-brand">{r.nickname.slice(0, 1)}</span>
                  <div className="min-w-0">
                    <b className="block truncate font-medium">{r.nickname}</b>
                    <span className="hint">{r.group}</span>
                  </div>
                  {r.leave && <span className="pill-wait">แจ้งลา</span>}
                </div>
                <fieldset className="flex gap-2">
                  <legend className="sr-only">การเข้าเรียนของ {r.nickname}</legend>
                  {[["present", "มา"], ["absent", r.leave ? "ลา" : "ขาด"]].map(([val, label]) => (
                    <label
                      key={val}
                      className={`grid min-h-11 min-w-16 cursor-pointer place-items-center rounded-[10px] border px-3 font-medium transition has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-brand ${s === val ? (val === "present" ? "border-brand bg-brand text-brand-ink" : "border-coral bg-coral-tint text-coral") : "border-line hover:border-brand"}`}
                    >
                      <input type="radio" name={`status_${r.id}`} value={val} checked={s === val} onChange={() => setStatus({ ...status, [r.id]: val })} className="sr-only" />
                      {label}
                    </label>
                  ))}
                </fieldset>
              </div>

              {s === "present" && (
                <div className="grid gap-1">
                  <label htmlFor={`focus_${r.id}`} className="flex justify-between text-sm">
                    <span>คะแนนจดจ่อในคาบ</span>
                    <b className="tabular-nums">{focus[r.id]}/100</b>
                  </label>
                  <input
                    id={`focus_${r.id}`}
                    name={`focus_${r.id}`}
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={focus[r.id]}
                    onChange={(e) => setFocus({ ...focus, [r.id]: Number(e.target.value) })}
                    className="min-h-8 accent-brand"
                  />
                </div>
              )}
              <div className="grid gap-1">
                <label htmlFor={`note_${r.id}`} className="text-sm">บันทึกพฤติกรรม (ไม่บังคับ)</label>
                <textarea id={`note_${r.id}`} name={`note_${r.id}`} rows={2} maxLength={500} defaultValue={r.note ?? ""} className="input min-h-16 py-2.5" placeholder="เช่น ตั้งใจดีช่วงหายใจ แต่วอกแวกช่วงเกม" />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur">
        <button className="btn-primary" disabled={pending}>{pending ? "กำลังบันทึก…" : "บันทึกการเช็กชื่อ"}</button>
        <span role="status" className={`text-sm ${state?.error ? "text-err" : "text-brand"}`}>{state?.error ?? state?.ok}</span>
      </div>
    </form>
  );
}
