import type { AgeGroup } from "./format";
import { bkkParts } from "./format";

/**
 * Daily missions: 2 are done by playing in the app (read from game_sessions),
 * 1 off-screen mission rotates by day and is ticked by the learner.
 * Stars: 1 per mission + 2 bonus when all 3 are done. Streak: consecutive days with ≥1 mission.
 */
export type Mission = { code: string; title: string; detail: string; kind: "breath" | "brain" | "offscreen" };

const KID_TASKS: [string, string, string][] = [
  ["tidy_desk", "จัดโต๊ะ จัดใจ", "เก็บโต๊ะให้เรียบร้อยก่อนเริ่มทำการบ้านหรือเล่น"],
  ["tidy_toys", "เก็บของเข้าที่ 5 นาที", "เลือกของ 5 ชิ้นแล้วเก็บเข้าที่ให้ครบ"],
  ["listen", "หูไว ใจนิ่ง", "หลับตาฟังเสียงรอบตัว 1 นาที แล้วเล่าให้คนที่บ้านฟังว่าได้ยินอะไร"],
  ["mandala", "ระบายสีอย่างจดจ่อ", "ระบายสีหรือวาดรูปให้เสร็จ 1 ภาพโดยไม่ลุกไปไหน"],
  ["help_home", "ช่วยงานบ้าน 1 อย่าง", "ทำให้เสร็จอย่างตั้งใจตั้งแต่ต้นจนจบ"],
];
const ADULT_TASKS: [string, string, string][] = [
  ["tidy_desk", "จัดโต๊ะก่อนเริ่มงาน", "เก็บของที่ไม่ใช้ออกจากโต๊ะ ให้เหลือแค่สิ่งที่ต้องใช้"],
  ["deep_work", "จดจ่อ 25 นาที", "ทำงานหรืออ่านหนังสืออย่างเดียว 25 นาที โดยไม่เช็กมือถือ"],
  ["slow_walk", "เดินช้าอย่างมีสติ", "เดินช้า ๆ 5 นาที รับรู้เท้าที่สัมผัสพื้นทุกก้าว"],
  ["gratitude", "ขอบคุณ 3 อย่าง", "จดสิ่งที่รู้สึกขอบคุณวันนี้ 3 อย่าง"],
  ["mindful_meal", "กินอย่างมีสติ", "กินข้าว 1 มื้อโดยไม่ดูจอ"],
];

const isKid = (g: AgeGroup) => g === "seed" || g === "sprout" || g === "tree";

/** The 3 missions of a Bangkok day ("YYYY-MM-DD"). */
export function missionsFor(day: string, group: AgeGroup): Mission[] {
  const tasks = isKid(group) ? KID_TASKS : ADULT_TASKS;
  const n = Math.floor(Date.parse(`${day}T00:00:00Z`) / 864e5);
  const [code, title, detail] = tasks[((n % tasks.length) + tasks.length) % tasks.length];
  return [
    { code: "breath", title: "ฝึกหายใจ 4-4", detail: "ฝึก Breathing Bubble อย่างน้อย 2 รอบหายใจ แล้วกดบันทึก", kind: "breath" },
    { code: "brain", title: "เล่นเกมฝึกสมอง 2 รอบ", detail: "Memory Sequence, Go/No-Go หรือ Stroop ก็ได้", kind: "brain" },
    { code, title, detail, kind: "offscreen" },
  ];
}

export type DayStat = { day: string; done: string[]; stars: number };

/** Per-day completion from game rounds and ticked off-screen missions. */
export function dayStats(days: string[], rounds: { created_at: string; code: string }[], checks: { day: string; code: string }[], group: AgeGroup): DayStat[] {
  return days.map((day) => {
    const today = rounds.filter((r) => bkkParts(new Date(r.created_at)).key === day);
    const ms = missionsFor(day, group);
    const done = ms
      .filter((m) =>
        m.kind === "breath"
          ? today.some((r) => r.code === "breathing_bubble")
          : m.kind === "brain"
            ? today.filter((r) => r.code !== "breathing_bubble").length >= 2
            : checks.some((c) => c.day === day && c.code === m.code),
      )
      .map((m) => m.code);
    return { day, done, stars: done.length + (done.length === ms.length ? 2 : 0) };
  });
}

/** Consecutive days with at least one mission, ending today (or yesterday if today is still empty). */
export function streakOf(stats: DayStat[]) {
  const s = [...stats].reverse(); // newest first; stats must be consecutive days ending today
  let i = s[0]?.done.length ? 0 : 1;
  let n = 0;
  while (i < s.length && s[i].done.length) {
    n++;
    i++;
  }
  return n;
}

export const BADGES: [string, string, (streak: number, stars: number) => boolean][] = [
  ["first", "ภารกิจแรก", (_, st) => st >= 1],
  ["streak3", "ต่อเนื่อง 3 วัน", (s) => s >= 3],
  ["streak7", "ต่อเนื่อง 7 วัน", (s) => s >= 7],
  ["stars50", "สะสม 50 ดาว", (_, st) => st >= 50],
  ["streak30", "ต่อเนื่อง 30 วัน", (s) => s >= 30],
  ["stars200", "สะสม 200 ดาว", (_, st) => st >= 200],
];

/** Bangkok day keys, oldest first, `count` days ending at `now`. */
export function lastDays(now: number, count: number) {
  return Array.from({ length: count }, (_, i) => bkkParts(new Date(now - (count - 1 - i) * 864e5)).key);
}
