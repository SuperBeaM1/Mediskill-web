export const TZ = "Asia/Bangkok";

export type AgeGroup = "seed" | "sprout" | "tree" | "teen" | "adult" | "senior";

export const AGE_GROUP_LABEL: Record<AgeGroup, string> = {
  seed: "Seed เมล็ด",
  sprout: "Sprout ต้นกล้า",
  tree: "Tree ต้นไม้",
  teen: "วัยรุ่น",
  adult: "วัยทำงาน",
  senior: "วัยเกษียณ",
};

/** Recommended daily game time per age group, in minutes. */
export const LIMIT_HINT: Record<AgeGroup, string> = {
  seed: "แนะนำ 10–15 นาทีสำหรับกลุ่ม Seed",
  sprout: "แนะนำ 15–20 นาทีสำหรับกลุ่ม Sprout",
  tree: "แนะนำ 15–20 นาทีสำหรับกลุ่ม Tree",
  teen: "แนะนำ 20 นาทีสำหรับวัยรุ่น",
  adult: "แนะนำ 20 นาทีสำหรับวัยทำงาน",
  senior: "แนะนำ 15–20 นาทีสำหรับวัยเกษียณ",
};

export function ageOf(birthYear: number, now = new Date()) {
  return now.getFullYear() - birthYear;
}

export function ageGroupOf(age: number): AgeGroup {
  return age <= 7 ? "seed" : age <= 10 ? "sprout" : age <= 12 ? "tree" : age <= 19 ? "teen" : age <= 59 ? "adult" : "senior";
}

const dateFmt = new Intl.DateTimeFormat("th-TH", { timeZone: TZ, weekday: "short", day: "numeric", month: "short" });
const timeFmt = new Intl.DateTimeFormat("th-TH", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
const longDateFmt = new Intl.DateTimeFormat("th-TH", { timeZone: TZ, day: "numeric", month: "short", year: "numeric" });

export const fmtDate = (d: string | Date) => dateFmt.format(new Date(d));
export const fmtTime = (d: string | Date) => timeFmt.format(new Date(d));
export const fmtLongDate = (d: string | Date) => longDateFmt.format(new Date(d));
export const fmtBaht = (n: number) => n.toLocaleString("th-TH");

/** Y-M-D of a date in Bangkok time. */
export function bkkParts(d: Date) {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  const [y, m, day] = p.split("-").map(Number);
  return { y, m, d: day, key: p };
}

/** Current time; kept outside components so render code stays pure for the linter. */
export const nowMs = () => Date.now();
export const rand = () => Math.random();
