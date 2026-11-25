import Link from "next/link";
import { PageHead } from "@/components/ChildSwitcher";
import { AGE_GROUP_LABEL, bkkParts, fmtDate, fmtTime, nowMs, type AgeGroup } from "@/lib/format";
import { requireTeacher } from "@/lib/supabase/server";

type Cls = {
  id: string;
  title: string;
  room: string | null;
  age_group: AgeGroup;
  course: { name: string } | null;
  enrollments: { status: string }[];
  class_sessions: { id: string; session_no: number; topic: string; starts_at: string; ends_at: string }[];
};

export default async function TeacherHome() {
  const { supabase, user, name } = await requireTeacher();
  const { data } = await supabase
    .from("classes")
    .select("id, title, room, age_group, course:courses(name), enrollments(status), class_sessions(id, session_no, topic, starts_at, ends_at)")
    .eq("teacher_id", user.id)
    .order("title");
  const classes = (data ?? []) as unknown as Cls[];

  const now = nowMs();
  const todayKey = bkkParts(new Date(now)).key;
  const weekEnd = now + 7 * 864e5;
  const sessions = classes
    .flatMap((c) => c.class_sessions.map((s) => ({ ...s, cls: c })))
    .filter((s) => Date.parse(s.ends_at) > now - 864e5 && Date.parse(s.starts_at) < weekEnd)
    .sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at));
  const today = sessions.filter((s) => bkkParts(new Date(s.starts_at)).key === todayKey);
  const later = sessions.filter((s) => bkkParts(new Date(s.starts_at)).key > todayKey);

  return (
    <>
      <PageHead title={`สวัสดี ครู${name.split(" ")[0]}`} sub={classes.length ? `ดูแล ${classes.length} คลาส` : "ยังไม่มีคลาสที่ได้รับมอบหมาย แอดมินเป็นคนมอบคลาสให้ครู"} />

      <section className="panel" aria-labelledby="h-today">
        <h2 id="h-today" className="text-lg font-semibold">วันนี้</h2>
        {today.length === 0 ? <p className="hint">วันนี้ไม่มีคาบสอน</p> : <SessionList items={today} />}
      </section>

      <section className="panel" aria-labelledby="h-week">
        <h2 id="h-week" className="text-lg font-semibold">7 วันข้างหน้า</h2>
        {later.length === 0 ? <p className="hint">ไม่มีคาบสอนในสัปดาห์นี้</p> : <SessionList items={later} />}
      </section>

      {classes.length > 0 && (
        <section aria-labelledby="h-classes" className="grid gap-3">
          <h2 id="h-classes" className="text-lg font-semibold">คลาสของฉัน</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {classes.map((c) => {
              const seats = c.enrollments.filter((e) => e.status !== "cancelled").length;
              const done = c.class_sessions.filter((s) => Date.parse(s.starts_at) <= now).length;
              return (
                <article key={c.id} className="rounded-xl border border-line bg-surface p-5">
                  <span className="text-sm font-medium text-orange">{c.course?.name}</span>
                  <h3 className="text-lg font-semibold">{c.title}</h3>
                  <p className="hint">{AGE_GROUP_LABEL[c.age_group]}{c.room ? ` · ${c.room}` : ""}</p>
                  <p className="mt-2 text-[15px]">ผู้เรียน {seats} คน · สอนไปแล้ว {done}/{c.class_sessions.length} คาบ</p>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}

function SessionList({ items }: { items: (Cls["class_sessions"][number] & { cls: Cls })[] }) {
  return (
    <ul className="grid gap-2">
      {items.map((s) => (
        <li key={s.id}>
          <Link
            href={`/teacher/sessions/${s.id}`}
            className="grid grid-cols-[84px_1fr_auto] items-center gap-3 rounded-[10px] border border-line px-3.5 py-3 no-underline transition hover:border-brand hover:bg-brand-tint"
          >
            <span className="text-sm tabular-nums">
              <b className="block font-medium text-ink">{fmtTime(s.starts_at)}</b>
              <span className="text-soft">{fmtDate(s.starts_at)}</span>
            </span>
            <span className="min-w-0">
              <b className="block truncate font-medium text-ink">{s.cls.title}</b>
              <span className="hint block truncate">คาบ {s.session_no} · {s.topic}{s.cls.room ? ` · ${s.cls.room}` : ""}</span>
            </span>
            <span className="text-sm font-medium text-brand">เช็กชื่อ</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
