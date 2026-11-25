import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgeGroup } from "./format";

export type Child = {
  id: string;
  nickname: string;
  birth_year: number;
  age_group: AgeGroup;
  daily_limit_min: number;
};

export type Session = { id: string; session_no: number; topic: string; starts_at: string; ends_at: string };

export type Enrollment = {
  id: string;
  status: "pending" | "active" | "completed" | "cancelled";
  class: { id: string; title: string; room: string | null; course: { name: string; level: number; sessions: number } };
};

/** Children of the signed-in parent (RLS) and the one picked by ?child=. */
export async function getFamily(supabase: SupabaseClient, childParam?: string) {
  const { data } = await supabase
    .from("children")
    .select("id, nickname, birth_year, age_group, daily_limit_min")
    .order("created_at");
  const kids = (data ?? []) as Child[];
  const current = kids.find((k) => k.id === childParam) ?? kids[0] ?? null;
  return { kids, current };
}

export async function getEnrollment(supabase: SupabaseClient, childId: string) {
  const { data } = await supabase
    .from("enrollments")
    .select("id, status, class:classes(id, title, room, course:courses(name, level, sessions))")
    .eq("child_id", childId)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as Enrollment | null;
}

/** Sessions of a class with this child's attendance and leave requests. */
export async function getSessions(supabase: SupabaseClient, classId: string, childId: string) {
  const [s, a, l] = await Promise.all([
    supabase.from("class_sessions").select("id, session_no, topic, starts_at, ends_at").eq("class_id", classId).order("session_no"),
    supabase.from("attendance").select("session_id, present, focus_score, behavior_note").eq("child_id", childId),
    supabase.from("leave_requests").select("session_id").eq("child_id", childId),
  ]);
  const att = new Map((a.data ?? []).map((r) => [r.session_id as string, r as { present: boolean; focus_score: number | null; behavior_note: string | null }]));
  const leaves = new Set((l.data ?? []).map((r) => r.session_id as string));
  return ((s.data ?? []) as Session[]).map((x) => ({ ...x, attendance: att.get(x.id) ?? null, leave: leaves.has(x.id) }));
}

export type SessionRow = Awaited<ReturnType<typeof getSessions>>[number];
