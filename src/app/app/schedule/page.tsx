import type { Metadata } from "next";
import Link from "next/link";
import { ChildSwitcher, PageHead } from "@/components/ChildSwitcher";
import { getEnrollment, getFamily, getSessions, type SessionRow } from "@/lib/data";
import { bkkParts, fmtDate, fmtTime, nowMs } from "@/lib/format";
import { requireUser } from "@/lib/supabase/server";
import { cancelLeave, requestLeave } from "../actions";

export const metadata: Metadata = { title: "ตารางเรียน" };

const MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
const HOUR = 3600e3;

export default async function SchedulePage({ searchParams }: PageProps<"/app/schedule">) {
  const sp = await searchParams;
  const { supabase } = await requireUser();
  const { kids, current } = await getFamily(supabase, typeof sp.child === "string" ? sp.child : undefined);
  if (!current) return <PageHead title="ตารางเรียน" sub="ยังไม่มีผู้เรียนในบัญชีนี้ เพิ่มได้ที่หน้าภาพรวม" />;

  const enrollment = await getEnrollment(supabase, current.id);
  const today = bkkParts(new Date());
  const m = typeof sp.m === "string" && /^\d{4}-\d{2}$/.test(sp.m) ? sp.m : today.key.slice(0, 7);
  const [y, mo] = m.split("-").map(Number);

  const head = (
    <PageHead title="ตารางเรียน" sub={enrollment ? `${enrollment.class.title} · ${enrollment.class.room ?? ""}` : `${current.nickname}ยังไม่ได้ลงทะเบียนรอบเรียน`}>
      <ChildSwitcher kids={kids} current={current} base="/app/schedule" />
    </PageHead>
  );
  if (!enrollment) {
    return (
      <>
        {head}
        <section className="panel">
          <p>เลือกรอบเรียนได้ที่หน้าภาพรวม</p>
          <Link href={`/app?child=${current.id}`} className="btn-primary justify-self-start">เลือกรอบเรียน</Link>
        </section>
      </>
    );
  }

  const sessions = await getSessions(supabase, enrollment.class.id, current.id);
  const now = nowMs();
  const upcoming = sessions.filter((s) => new Date(s.starts_at).getTime() > now).slice(0, 4);
  const byDay = new Map<string, SessionRow[]>();
  for (const s of sessions) {
    const k = bkkParts(new Date(s.starts_at)).key;
    byDay.set(k, [...(byDay.get(k) ?? []), s]);
  }
  const leaves = sessions.filter((s) => s.leave && new Date(s.starts_at).getTime() > now).length;

  const first = new Date(Date.UTC(y, mo - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7; // Monday-first
  const daysIn = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  const shift = (d: number) => {
    const t = new Date(Date.UTC(y, mo - 1 + d, 1));
    return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}`;
  };
  const q = (month: string) => `/app/schedule?child=${current.id}&m=${month}`;

  return (
    <>
      {head}
      <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <section className="panel" aria-labelledby="h-cal">
          <div className="flex items-center justify-between gap-3">
            <Link href={q(shift(-1))} className="btn-ghost min-h-10 px-3" aria-label="เดือนก่อน">‹</Link>
            <h2 id="h-cal" className="text-lg font-semibold">{MONTHS[mo - 1]} {y + 543}</h2>
            <Link href={q(shift(1))} className="btn-ghost min-h-10 px-3" aria-label="เดือนถัดไป">›</Link>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"].map((d) => (
              <div key={d} className="text-center text-xs text-soft">{d}</div>
            ))}
            {Array.from({ length: offset }, (_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysIn }, (_, i) => {
              const d = i + 1;
              const key = `${m}-${String(d).padStart(2, "0")}`;
              const isToday = key === today.key;
              return (
                <div key={key} className={`flex min-h-12 min-w-0 flex-col justify-between gap-1 rounded-lg border p-1 text-[13px] tabular-nums sm:min-h-[60px] sm:p-1.5 ${isToday ? "border-2 border-ink font-semibold" : "border-line"} ${key < today.key ? "text-soft" : ""}`}>
                  <span>{d}</span>
                  {byDay.get(key)?.map((s) => <DayTag key={s.id} s={s} now={now} />)}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4 text-[13px] text-soft">
            <span><i className="mr-1.5 inline-block size-3 rounded bg-brand-tint align-[-1px]" />มาเรียน</span>
            <span><i className="mr-1.5 inline-block size-3 rounded bg-coral-tint align-[-1px]" />ขาด</span>
            <span><i className="mr-1.5 inline-block size-3 rounded bg-brand align-[-1px]" />คาบที่จะถึง</span>
            <span><i className="mr-1.5 inline-block size-3 rounded bg-sun-tint align-[-1px]" />แจ้งลา</span>
          </div>
        </section>

        <div className="grid min-w-0 content-start gap-5">
          <section className="panel" aria-labelledby="h-up">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="h-up" className="text-lg font-semibold">คาบที่กำลังจะมาถึง</h2>
              <span className="hint">แจ้งลาได้ก่อนเรียน 24 ชม.</span>
            </div>
            {upcoming.length === 0 && <p className="text-soft">ไม่มีคาบที่จะถึงในรอบนี้</p>}
            <div className="grid">
              {upcoming.map((s) => {
                const canChange = new Date(s.starts_at).getTime() - now > 24 * HOUR;
                return (
                  <form key={s.id} action={s.leave ? cancelLeave : requestLeave} className="grid grid-cols-[1fr_auto] items-center gap-3 border-t border-line py-2.5 text-[15px] first:border-t-0">
                    <input type="hidden" name="session_id" value={s.id} />
                    <input type="hidden" name="child_id" value={current.id} />
                    <div className="min-w-0">
                      คาบ {s.session_no} · {s.topic}
                      <small className="block text-[13px] text-soft">
                        {fmtDate(s.starts_at)} · {fmtTime(s.starts_at)}–{fmtTime(s.ends_at)} {s.leave && <span className="pill-wait ml-1">แจ้งลาแล้ว</span>}
                      </small>
                    </div>
                    {canChange ? (
                      <button type="submit" className="btn-ghost min-h-10 px-3.5 text-sm">{s.leave ? "ยกเลิกลา" : "แจ้งลา"}</button>
                    ) : (
                      <span className="hint">ใกล้เวลาเรียนแล้ว</span>
                    )}
                  </form>
                );
              })}
            </div>
          </section>
          <section className="panel bg-brand-tint" aria-labelledby="h-mk">
            <h2 id="h-mk" className="text-lg font-semibold">เรียนชดเชย</h2>
            <p className="text-[15px] text-soft">
              {leaves
                ? `${current.nickname}มีสิทธิ์เรียนชดเชย ${leaves} คาบ ทีมดูแลผู้ปกครองจะติดต่อนัดรอบชดเชยทาง LINE`
                : "แจ้งลาล่วงหน้า 24 ชม. ได้สิทธิ์เรียนชดเชย ทีมดูแลผู้ปกครองจะติดต่อนัดรอบให้"}
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

function DayTag({ s, now }: { s: SessionRow; now: number }) {
  const [cls, text] = s.leave
    ? ["bg-sun-tint text-sun", "ลา"]
    : s.attendance
      ? s.attendance.present
        ? ["bg-brand-tint text-brand", "มาเรียน"]
        : ["bg-coral-tint text-coral", "ขาด"]
      : new Date(s.starts_at).getTime() > now
        ? ["bg-brand text-brand-ink", fmtTime(s.starts_at)]
        : ["bg-bg text-soft", "รอเช็กชื่อ"];
  return <span className={`truncate rounded px-1 text-center text-[10px] leading-normal sm:text-[11px] ${cls}`}>{text}</span>;
}
