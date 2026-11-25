import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AGE_GROUP_LABEL, ageOf, fmtDate, fmtTime, type AgeGroup } from "@/lib/format";
import { requireTeacher } from "@/lib/supabase/server";
import { Roster, type RosterRow } from "./Roster";

export const metadata: Metadata = { title: "เช็กชื่อ" };

type Session = {
  id: string;
  session_no: number;
  topic: string;
  starts_at: string;
  ends_at: string;
  class: { id: string; title: string; room: string | null; teacher_id: string | null } | null;
};

export default async function SessionPage({ params }: PageProps<"/teacher/sessions/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase, user } = await requireTeacher();

  const { data: s } = await supabase
    .from("class_sessions")
    .select("id, session_no, topic, starts_at, ends_at, class:classes(id, title, room, teacher_id)")
    .eq("id", id)
    .maybeSingle();
  const session = s as unknown as Session | null;
  if (!session?.class || session.class.teacher_id !== user.id) notFound();

  const [{ data: enr }, { data: att }, { data: leaves }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("status, child:children(id, nickname, birth_year, age_group)")
      .eq("class_id", session.class.id)
      .neq("status", "cancelled"),
    supabase.from("attendance").select("child_id, present, focus_score, behavior_note").eq("session_id", id),
    supabase.from("leave_requests").select("child_id").eq("session_id", id),
  ]);

  const attBy = new Map((att ?? []).map((a) => [a.child_id as string, a]));
  const leaveSet = new Set((leaves ?? []).map((l) => l.child_id as string));
  const rows: RosterRow[] = ((enr ?? []) as unknown as { child: { id: string; nickname: string; birth_year: number; age_group: AgeGroup } | null }[])
    .flatMap((e) => (e.child ? [e.child] : []))
    .sort((a, b) => a.nickname.localeCompare(b.nickname, "th"))
    .map((c) => {
      const a = attBy.get(c.id);
      return {
        id: c.id,
        nickname: c.nickname,
        group: `${ageOf(c.birth_year)} ปี · ${AGE_GROUP_LABEL[c.age_group]}`,
        leave: leaveSet.has(c.id),
        present: a ? (a.present as boolean) : null,
        focus: a ? (a.focus_score as number | null) : null,
        note: a ? (a.behavior_note as string | null) : null,
      };
    });

  return (
    <>
      <Link href="/teacher" className="text-sm text-brand">← ตารางสอน</Link>
      <div>
        <span className="text-sm font-medium text-orange">คาบ {session.session_no} · {session.topic}</span>
        <h1 className="text-[clamp(22px,3vw,28px)] font-semibold">{session.class.title}</h1>
        <p className="text-soft">
          {fmtDate(session.starts_at)} {fmtTime(session.starts_at)}–{fmtTime(session.ends_at)}{session.class.room ? ` · ${session.class.room}` : ""}
        </p>
      </div>
      {rows.length === 0 ? (
        <p className="panel hint">ยังไม่มีผู้เรียนลงทะเบียนในคลาสนี้</p>
      ) : (
        <Roster sessionId={session.id} rows={rows} />
      )}
    </>
  );
}
