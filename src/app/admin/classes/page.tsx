import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/ChildSwitcher";
import { AGE_GROUP_LABEL, fmtDate, fmtTime, nowMs, type AgeGroup } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase/server";
import { assignTeacher } from "../actions";

export const metadata: Metadata = { title: "คลาสเรียน" };

type Cls = {
  id: string;
  title: string;
  room: string | null;
  capacity: number;
  teacher_id: string | null;
  age_group: AgeGroup;
  course: { name: string; sessions: number } | null;
  enrollments: { status: string }[];
  class_sessions: { session_no: number; topic: string; starts_at: string }[];
};

export default async function ClassesPage() {
  const { supabase } = await requireAdmin();
  const { data: teachers } = await supabase.from("profiles").select("id, full_name").in("role", ["teacher", "admin"]).order("full_name");
  const { data } = await supabase
    .from("classes")
    .select("id, title, room, capacity, teacher_id, age_group, course:courses(name, sessions), enrollments(status), class_sessions(session_no, topic, starts_at)")
    .order("title");
  const classes = (data ?? []) as unknown as Cls[];
  const now = nowMs();

  return (
    <>
      <PageHead title="คลาสเรียน" sub={`${classes.length} คลาส · นับเฉพาะที่นั่งของคนที่ยังไม่ยกเลิก`}>
        <Link href="/admin/classes/new" className="btn-primary">+ สร้างคลาส</Link>
      </PageHead>
      {classes.length === 0 && <p className="panel hint">ยังไม่มีคลาส</p>}
      <div className="grid gap-4 xl:grid-cols-3 md:grid-cols-2">
        {classes.map((c) => {
          const seats = c.enrollments.filter((e) => e.status !== "cancelled").length;
          const active = c.enrollments.filter((e) => e.status === "active").length;
          const sessions = [...c.class_sessions].sort((a, b) => a.session_no - b.session_no);
          const next = sessions.find((s) => Date.parse(s.starts_at) > now);
          const done = sessions.filter((s) => Date.parse(s.starts_at) <= now).length;
          const full = seats >= c.capacity;
          return (
            <article key={c.id} className="panel">
              <div>
                <span className="text-sm font-medium text-orange">{c.course?.name ?? "–"}</span>
                <h2 className="text-lg font-semibold">{c.title}</h2>
                <span className="hint">{AGE_GROUP_LABEL[c.age_group]}{c.room ? ` · ${c.room}` : ""}</span>
              </div>
              <div>
                <div className="flex items-baseline justify-between text-sm">
                  <span>ที่นั่ง</span>
                  <b className={`tabular-nums ${full ? "text-coral" : ""}`}>{seats}/{c.capacity}{full ? " เต็ม" : ""}</b>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-mute" role="img" aria-label={`จองแล้ว ${seats} จาก ${c.capacity} ที่นั่ง`}>
                  <span className={`block h-full rounded-full ${full ? "bg-coral" : "bg-brand"}`} style={{ width: `${Math.min((seats / c.capacity) * 100, 100)}%` }} />
                </div>
                <span className="hint">ชำระแล้ว {active} · รอชำระ {seats - active}</span>
              </div>
              <p className="border-t border-dashed border-line pt-3 text-[15px]">
                <span className="text-soft">เรียนไปแล้ว {done}/{sessions.length || c.course?.sessions || 0} คาบ</span>
                <br />
                {next ? (
                  <>คาบถัดไป: <b className="font-medium">{fmtDate(next.starts_at)} {fmtTime(next.starts_at)}</b> · คาบ {next.session_no} {next.topic}</>
                ) : (
                  "ไม่มีคาบที่จะถึง"
                )}
              </p>
              <form action={assignTeacher} className="flex gap-2 border-t border-dashed border-line pt-3">
                <input type="hidden" name="class_id" value={c.id} />
                <label htmlFor={`t-${c.id}`} className="sr-only">ครูประจำคลาส {c.title}</label>
                <select id={`t-${c.id}`} name="teacher_id" defaultValue={c.teacher_id ?? ""} className="input min-h-11 flex-1">
                  <option value="">ยังไม่มีครู</option>
                  {(teachers ?? []).map((t) => (
                    <option key={t.id} value={t.id}>ครู{t.full_name}</option>
                  ))}
                </select>
                <button className="btn-ghost min-h-11">มอบหมาย</button>
              </form>
            </article>
          );
        })}
      </div>
    </>
  );
}
