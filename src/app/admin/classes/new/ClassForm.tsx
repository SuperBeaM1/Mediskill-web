"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AGE_GROUP_LABEL, type AgeGroup } from "@/lib/format";
import { createClass, type ClassState } from "../../actions";

const DAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const GROUP_AGES: Record<AgeGroup, string> = { seed: "5–7 ปี", sprout: "8–10 ปี", tree: "11–12 ปี", teen: "13–19 ปี", adult: "20–59 ปี", senior: "60 ปีขึ้นไป" };

type Course = { level: number; name: string; sessions: number };

function Err({ msg }: { msg?: string }) {
  return msg ? <span role="alert" className="text-sm text-err">{msg}</span> : null;
}

export function ClassForm({ courses, today }: { courses: Course[]; today: string }) {
  const [state, action, pending] = useActionState<ClassState, FormData>(createClass, null);
  const v = state?.values;
  const f = state?.fields ?? {};
  const [level, setLevel] = useState(v?.level ?? "1");
  const [days, setDays] = useState<number[]>(v?.days ?? [6]);
  const course = courses.find((c) => String(c.level) === level);
  const weeks = course ? Math.ceil(course.sessions / Math.max(days.length, 1)) : 0;

  return (
    <form action={action} noValidate className="grid gap-5">
      {state?.error && <p role="alert" className="rounded-[10px] bg-coral-tint px-4 py-3 text-[15px] text-err">{state.error}</p>}

      <section className="panel">
        <h2 className="text-lg font-semibold">ข้อมูลคลาส</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="field">
            <label htmlFor="level">คอร์ส</label>
            <select id="level" name="level" className="input" value={level} onChange={(e) => setLevel(e.target.value)}>
              {courses.map((c) => (
                <option key={c.level} value={c.level}>{c.name} ({c.sessions} คาบ)</option>
              ))}
            </select>
            <Err msg={f.level} />
          </div>
          <div className="field">
            <label htmlFor="age_group">กลุ่มวัย</label>
            <select id="age_group" name="age_group" className="input" defaultValue={v?.age_group ?? "adult"} aria-invalid={!!f.age_group}>
              {(Object.keys(AGE_GROUP_LABEL) as AgeGroup[]).map((g) => (
                <option key={g} value={g}>{AGE_GROUP_LABEL[g]} · {GROUP_AGES[g]}</option>
              ))}
            </select>
            <Err msg={f.age_group} />
          </div>
          <div className="field sm:col-span-2">
            <label htmlFor="title">ชื่อคลาส</label>
            <input id="title" name="title" maxLength={120} required className="input" defaultValue={v?.title} placeholder="เช่น Level 1 · วัยทำงาน (เสาร์เช้า)" aria-invalid={!!f.title} />
            <Err msg={f.title} />
          </div>
          <div className="field">
            <label htmlFor="room">ห้อง</label>
            <input id="room" name="room" maxLength={60} className="input" defaultValue={v?.room} placeholder="เช่น ห้อง Focus 1 หรือ Google Meet" aria-invalid={!!f.room} />
            <Err msg={f.room} />
          </div>
          <div className="field">
            <label htmlFor="capacity">จำนวนที่นั่ง</label>
            <input id="capacity" name="capacity" type="number" inputMode="numeric" min={1} max={100} required className="input tabular-nums" defaultValue={v?.capacity ?? "10"} aria-invalid={!!f.capacity} />
            <Err msg={f.capacity} />
          </div>
        </div>
      </section>

      <section className="panel">
        <h2 className="text-lg font-semibold">ตารางเรียน</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="field">
            <label htmlFor="start">วันเริ่มเรียน</label>
            <input id="start" name="start" type="date" min={today} required className="input" defaultValue={v?.start} aria-invalid={!!f.start} />
            <Err msg={f.start} />
          </div>
          <div className="field">
            <label htmlFor="time">เวลาเริ่ม</label>
            <input id="time" name="time" type="time" required className="input" defaultValue={v?.time ?? "10:00"} aria-invalid={!!f.time} />
            <Err msg={f.time} />
          </div>
          <div className="field">
            <label htmlFor="minutes">ความยาวต่อคาบ (นาที)</label>
            <input id="minutes" name="minutes" type="number" inputMode="numeric" min={15} max={180} step={5} required className="input tabular-nums" defaultValue={v?.minutes ?? "60"} aria-invalid={!!f.minutes} />
            <Err msg={f.minutes} />
          </div>
        </div>
        <fieldset className="grid gap-2">
          <legend className="mb-2 text-[15px] font-medium">เรียนทุกวัน</legend>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d, i) => {
              const on = days.includes(i);
              return (
                <label key={d} className={`grid size-12 cursor-pointer place-items-center rounded-[10px] border font-display font-medium transition has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-brand ${on ? "border-brand bg-brand text-brand-ink" : "border-line bg-surface hover:border-brand"}`}>
                  <input type="checkbox" name="days" value={i} checked={on} onChange={() => setDays(on ? days.filter((x) => x !== i) : [...days, i].sort())} className="sr-only" />
                  {d}
                </label>
              );
            })}
          </div>
          <Err msg={f.days} />
        </fieldset>
        <p className="rounded-[10px] bg-brand-tint px-4 py-3 text-[15px] text-brand" aria-live="polite">
          ระบบจะสร้าง {course?.sessions ?? 0} คาบให้อัตโนมัติ {days.length ? `เรียนสัปดาห์ละ ${days.length} วัน ประมาณ ${weeks} สัปดาห์` : "เลือกวันเรียนก่อน"}
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <button className="btn-primary" disabled={pending}>{pending ? "กำลังสร้าง…" : "สร้างคลาส"}</button>
        <Link href="/admin/classes" className="btn-ghost">ยกเลิก</Link>
      </div>
    </form>
  );
}
