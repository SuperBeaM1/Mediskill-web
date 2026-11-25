import type { SupabaseClient } from "@supabase/supabase-js";
import { bkkParts } from "./format";

/**
 * 6-I scores (0–100) computed live from game rounds and teacher roll call.
 * A dimension is null when there is not enough data that month.
 *
 * IQ  memory span: average of the 3 best Memory Sequence spans, span 1 → 0, span 9 → 100
 * EF  average accuracy of Go/No-Go and Stroop rounds
 * EQ  average of teacher focus score (present sessions) and breathing practice (1 min = 10, max 100)
 * AQ  bounce-back: share of rounds below the learner's best that were followed by another try the same day
 * MQ  discipline: days practised this month, 20 days = 100
 * SQ  participation: share of recorded class sessions attended
 */
export const SIX_KEYS = ["iq", "ef", "eq", "aq", "mq", "sq"] as const;
export type SixKey = (typeof SIX_KEYS)[number];
export type SixScores = Record<SixKey, number | null>;

export const SIX_LABEL: Record<SixKey, string> = {
  iq: "ความจำและตรรกะ",
  ef: "ควบคุมตนเองและต้านสิ่งรบกวน",
  eq: "จดจ่อและคุมอารมณ์",
  aq: "ลุกขึ้นใหม่หลังพลาด",
  mq: "วินัยในการฝึก",
  sq: "เข้าร่วมกิจกรรมกลุ่ม",
};

export type GameRound = { created_at: string; score: number; accuracy: number | null; duration_s: number; code: string };
export type RollCall = { present: boolean; focus_score: number | null; starts_at: string };
export type SixBasis = Record<SixKey, string>;

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
export const monthKeyOf = (iso: string) => bkkParts(new Date(iso)).key.slice(0, 7);

/** Bangkok month keys ("YYYY-MM"), oldest first, ending with the month of `now`. */
export function lastMonths(now: number, count: number) {
  const { y, m } = bkkParts(new Date(now));
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 - (count - 1 - i), 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  });
}

export function computeSixI(rounds: GameRound[], calls: RollCall[], month: string): { scores: SixScores; basis: SixBasis } {
  const g = rounds.filter((r) => monthKeyOf(r.created_at) === month).sort((a, b) => a.created_at.localeCompare(b.created_at));
  const c = calls.filter((r) => monthKeyOf(r.starts_at) === month);

  const spans = g.filter((r) => r.code === "memory_sequence").map((r) => r.score).sort((a, b) => b - a).slice(0, 3);
  const span = avg(spans);
  const iq = span == null ? null : clamp(((span - 1) / 8) * 100);

  const accs = g.filter((r) => (r.code === "go_no_go" || r.code === "stroop") && r.accuracy != null).map((r) => Number(r.accuracy));
  const ef = accs.length ? clamp(avg(accs)!) : null;

  const focus = avg(c.filter((r) => r.present && r.focus_score != null).map((r) => r.focus_score!));
  const breathMin = g.filter((r) => r.code === "breathing_bubble").reduce((a, r) => a + r.duration_s, 0) / 60;
  const eqParts = [focus, breathMin > 0 ? Math.min(100, breathMin * 10) : null].filter((x): x is number => x != null);
  const eq = eqParts.length ? clamp(avg(eqParts)!) : null;

  // AQ: after a round below the personal best, did they try that game again the same day?
  const best = new Map<string, number>();
  let chances = 0;
  let retries = 0;
  g.forEach((r, i) => {
    const b = best.get(r.code);
    if (b != null && r.score < b) {
      chances++;
      const day = bkkParts(new Date(r.created_at)).key;
      if (g.slice(i + 1).some((n) => n.code === r.code && bkkParts(new Date(n.created_at)).key === day)) retries++;
    }
    best.set(r.code, Math.max(b ?? 0, r.score));
  });
  const aq = chances >= 2 ? clamp((retries / chances) * 100) : null;

  const days = new Set(g.map((r) => bkkParts(new Date(r.created_at)).key)).size;
  const mq = days ? clamp(days * 5) : null;

  const present = c.filter((r) => r.present).length;
  const sq = c.length ? clamp((present / c.length) * 100) : null;

  return {
    scores: { iq, ef, eq, aq, mq, sq },
    basis: {
      iq: spans.length ? `จำลำดับได้ยาวสุดเฉลี่ย ${span!.toFixed(1)} ช่อง (Memory Sequence ${spans.length} รอบที่ดีที่สุด)` : "ยังไม่ได้เล่น Memory Sequence เดือนนี้",
      ef: accs.length ? `แม่นยำเฉลี่ย ${Math.round(avg(accs)!)}% จาก Go/No-Go และ Stroop ${accs.length} รอบ` : "ยังไม่ได้เล่น Go/No-Go หรือ Stroop เดือนนี้",
      eq: eqParts.length
        ? [focus != null ? `ครูให้คะแนนจดจ่อเฉลี่ย ${Math.round(focus)}` : null, breathMin > 0 ? `ฝึกหายใจ ${Math.round(breathMin)} นาที` : null].filter(Boolean).join(" · ")
        : "ยังไม่มีคะแนนจดจ่อจากครูหรือการฝึกหายใจ",
      aq: chances >= 2 ? `ทำได้ต่ำกว่าสถิติตัวเอง ${chances} ครั้ง และลองใหม่ทันที ${retries} ครั้ง` : "ข้อมูลยังไม่พอ ต้องเล่นซ้ำหลายรอบก่อน",
      mq: days ? `ฝึก ${days} วันในเดือนนี้ (เป้าหมาย 20 วัน)` : "ยังไม่ได้ฝึกเดือนนี้",
      sq: c.length ? `เข้าเรียน ${present} จาก ${c.length} คาบที่ครูเช็กชื่อแล้ว` : "ยังไม่มีการเช็กชื่อในคลาส",
    },
  };
}

/** Loads the rounds and roll calls a learner's 6-I needs, from `fromIso` onward (RLS-scoped). */
export async function loadSixIData(supabase: SupabaseClient, childId: string, fromIso: string) {
  const [{ data: g }, { data: a }] = await Promise.all([
    supabase
      .from("game_sessions")
      .select("created_at, score, accuracy, duration_s, game:games(code)")
      .eq("child_id", childId)
      .gte("created_at", fromIso)
      .order("created_at"),
    supabase.from("attendance").select("present, focus_score, session:class_sessions(starts_at)").eq("child_id", childId),
  ]);
  const rounds: GameRound[] = ((g ?? []) as unknown as { created_at: string; score: number; accuracy: number | null; duration_s: number; game: { code: string } | null }[])
    .map((r) => ({ created_at: r.created_at, score: r.score, accuracy: r.accuracy, duration_s: r.duration_s, code: r.game?.code ?? "" }));
  const calls: RollCall[] = ((a ?? []) as unknown as { present: boolean; focus_score: number | null; session: { starts_at: string } | null }[])
    .filter((r) => r.session && r.session.starts_at >= fromIso)
    .map((r) => ({ present: r.present, focus_score: r.focus_score, starts_at: r.session!.starts_at }));
  return { rounds, calls };
}
