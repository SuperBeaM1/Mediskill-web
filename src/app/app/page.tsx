import type { Metadata } from "next";
import Link from "next/link";
import { ChildSwitcher, PageHead } from "@/components/ChildSwitcher";
import { SixIBars } from "@/components/SixIBars";
import { getEnrollment, getFamily, getSessions, type Child } from "@/lib/data";
import { LIMIT_HINT, bkkParts, fmtDate, fmtLongDate, fmtTime, nowMs } from "@/lib/format";
import { computeSixI, lastMonths, loadSixIData, SIX_KEYS } from "@/lib/sixI";
import { requireUser } from "@/lib/supabase/server";
import { enroll, setDailyLimit } from "./actions";
import { AddLearner } from "./AddLearner";
import { LimitForm } from "./LimitForm";

export const metadata: Metadata = { title: "ภาพรวม" };

const DAY = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export default async function Dashboard({ searchParams }: PageProps<"/app">) {
  const { child } = await searchParams;
  const { supabase, user } = await requireUser();
  const [{ data: profile }, { kids, current }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    getFamily(supabase, typeof child === "string" ? child : undefined),
  ]);
  const name = profile?.full_name?.split(" ")[0] ?? "";

  if (!current) {
    return (
      <>
        <PageHead title={`สวัสดี คุณ${name}`} sub="เริ่มจากเพิ่มผู้เรียน แล้วเลือกรอบเรียนได้เลย" />
        <section className="panel">
          <h2 className="text-lg font-semibold">เพิ่มผู้เรียน</h2>
          <AddLearner first />
        </section>
      </>
    );
  }

  const enrollment = await getEnrollment(supabase, current.id);
  const head = (
    <PageHead title={`สวัสดี คุณ${name}`} sub={`ความคืบหน้าของ${current.nickname} ณ ${fmtLongDate(new Date())}`}>
      <div className="flex flex-wrap items-center gap-2">
        <ChildSwitcher kids={kids} current={current} base="/app" />
        <details className="group relative">
          <summary className="btn-ghost min-h-12 list-none [&::-webkit-details-marker]:hidden">+ เพิ่มผู้เรียน</summary>
          <div className="absolute right-0 z-20 mt-2 w-[min(92vw,460px)] rounded-xl border border-line bg-surface p-5 shadow-lg">
            <AddLearner />
          </div>
        </details>
      </div>
    </PageHead>
  );

  if (!enrollment) return <>{head}<EnrollPanel child={current} /></>;

  const since = new Date(nowMs() - 6 * 864e5);
  const [prevMonth, thisMonth] = lastMonths(nowMs(), 2);
  const [sessions, { data: games }, six] = await Promise.all([
    getSessions(supabase, enrollment.class.id, current.id),
    supabase.from("game_sessions").select("duration_s, created_at").eq("child_id", current.id).gte("created_at", new Date(since.toDateString()).toISOString()),
    loadSixIData(supabase, current.id, `${prevMonth}-01T00:00:00+07:00`),
  ]);

  const now = nowMs();
  const next = sessions.find((s) => new Date(s.starts_at).getTime() > now && !s.leave);
  const attended = sessions.filter((s) => s.attendance?.present).length;
  const total = enrollment.class.course.sessions;
  const scores = sessions.map((s) => s.attendance?.focus_score).filter((x): x is number => x != null);
  const focusAvg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  // minutes played per Bangkok day, last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * 864e5);
    return { key: bkkParts(d).key, label: DAY[new Date(bkkParts(d).key).getUTCDay()], min: 0 };
  });
  for (const g of games ?? []) {
    const day = days.find((d) => d.key === bkkParts(new Date(g.created_at)).key);
    if (day) day.min += Math.round(g.duration_s / 60);
  }
  const weekMin = days.reduce((a, d) => a + d.min, 0);

  const cur = computeSixI(six.rounds, six.calls, thisMonth).scores;
  const prev = computeSixI(six.rounds, six.calls, prevMonth).scores;
  const sixRows = SIX_KEYS.some((k) => cur[k] != null)
    ? SIX_KEYS.map((k) => [k.toUpperCase(), prev[k], cur[k]] as [string, number | null, number | null])
    : null;
  const note = [...sessions].reverse().find((s) => s.attendance?.behavior_note)?.attendance?.behavior_note;

  return (
    <>
      {head}
      {enrollment.status === "pending" && (
        <p className="rounded-xl bg-sun-tint px-4 py-3 text-[15px]">
          รอยืนยันการชำระเงินสำหรับ {enrollment.class.course.name}{" "}
          <Link href="/app/billing" className="font-medium text-brand">ไปหน้าชำระเงิน</Link>
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile k="คาบถัดไป" v={next ? `${fmtDate(next.starts_at)} ${fmtTime(next.starts_at)}` : "ไม่มีคาบที่จะถึง"} s={next ? `${next.topic} · ${enrollment.class.room ?? ""}` : enrollment.class.title} />
        <Tile k={enrollment.class.course.name} v={`${attended}/${total} คาบ`}>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg">
            <span className="block h-full rounded-full bg-brand" style={{ width: `${(attended / total) * 100}%` }} />
          </div>
        </Tile>
        <Tile k="เล่นเกม 7 วันล่าสุด" v={`${weekMin} นาที`} s={`เป้าหมายไม่เกิน ${current.daily_limit_min * 7} นาที`} />
        <Tile k="คะแนนจดจ่อเฉลี่ย" v={focusAvg != null ? `${focusAvg}/100` : "–"} s={focusAvg != null ? `จาก ${scores.length} คาบที่ครูให้คะแนน` : "ครูจะให้คะแนนหลังคาบแรก"} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <section className="panel" aria-labelledby="h-week">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="h-week" className="text-lg font-semibold">เวลาเล่นเกมฝึกสมอง 7 วันล่าสุด</h2>
            <span className="hint">รวม {weekMin} นาที · เฉลี่ย {Math.round(weekMin / 7)} นาที/วัน</span>
          </div>
          <WeekChart days={days} limit={current.daily_limit_min} />
        </section>
        <section className="panel" aria-labelledby="h-set">
          <h2 id="h-set" className="text-lg font-semibold">ตั้งเวลาเล่นต่อวัน</h2>
          <LimitForm key={current.id} action={setDailyLimit} childId={current.id} value={current.daily_limit_min} hint={LIMIT_HINT[current.age_group]} />
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <section className="panel" aria-labelledby="h-6i">
          <h2 id="h-6i" className="text-lg font-semibold">รายงาน 6-I</h2>
          {sixRows ? (
            <SixIBars rows={sixRows} label={`คะแนน 6-I ของ${current.nickname}`} />
          ) : (
            <p className="text-soft">ยังไม่มีข้อมูลเดือนนี้ เล่นเกมฝึกสมองหรือเข้าเรียน แล้วคะแนนจะขึ้นอัตโนมัติ</p>
          )}
          <Link href={`/app/report?child=${current.id}`} className="text-sm font-medium text-brand">ดูรายงาน 6-I ฉบับเต็ม</Link>
          {note && (
            <div className="rounded-r-[10px] border-l-3 border-brand bg-bg px-4 py-3.5 text-[15px]">
              <b className="mb-1 block font-display text-sm">บันทึกจากครู</b>
              {note}
            </div>
          )}
        </section>
        <section className="panel" aria-labelledby="h-sess">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="h-sess" className="text-lg font-semibold">คาบเรียนล่าสุด</h2>
            <Link href={`/app/schedule?child=${current.id}`} className="text-sm text-brand">ดูตารางทั้งหมด</Link>
          </div>
          <RecentSessions sessions={sessions.filter((s) => new Date(s.starts_at).getTime() < now).slice(-4).reverse()} />
        </section>
      </div>
    </>
  );
}

function Tile({ k, v, s, children }: { k: string; v: string; s?: string; children?: React.ReactNode }) {
  return (
    <div className="grid min-w-0 content-start gap-0.5 rounded-xl border border-line bg-surface px-4 py-4">
      <span className="text-[13px] text-soft">{k}</span>
      <span className="font-display text-[clamp(17px,2vw,22px)] font-semibold tabular-nums">{v}</span>
      {s && <span className="truncate text-[13px] text-soft">{s}</span>}
      {children}
    </div>
  );
}

function WeekChart({ days, limit }: { days: { key: string; label: string; min: number }[]; limit: number }) {
  const max = Math.max(30, limit, ...days.map((d) => d.min));
  return (
    <div>
      <div className="relative grid h-36 grid-cols-7 items-end gap-2.5 border-b border-line" role="img" aria-label={`เล่นเกม 7 วัน เกินเวลาที่ตั้ง ${days.filter((d) => d.min > limit).length} วัน`}>
        {days.map((d) => (
          <div key={d.key} className={`relative min-h-[3px] rounded-t-md ${d.min > limit ? "bg-sun" : "bg-brand"}`} style={{ height: `${(d.min / max) * 100}%` }}>
            <span className="absolute inset-x-0 bottom-full pb-0.5 text-center text-xs text-soft tabular-nums">{d.min || "–"}</span>
          </div>
        ))}
        <div className="pointer-events-none absolute inset-x-0 border-t-[1.5px] border-dashed border-coral" style={{ bottom: `${(limit / max) * 100}%` }}>
          <em className="absolute right-0 bottom-0.5 bg-surface pl-1.5 text-xs text-coral not-italic">{limit} นาที</em>
        </div>
      </div>
      <div className="mt-1.5 grid grid-cols-7 gap-2.5 text-center text-xs text-soft">
        {days.map((d) => <span key={d.key}>{d.label}</span>)}
      </div>
      <div className="mt-3 flex gap-4 text-[13px] text-soft">
        <span><i className="mr-1.5 inline-block size-3 rounded bg-brand align-[-1px]" />ไม่เกินเวลาที่ตั้ง</span>
        <span><i className="mr-1.5 inline-block size-3 rounded bg-sun align-[-1px]" />เกินเวลาที่ตั้ง</span>
      </div>
    </div>
  );
}

function RecentSessions({ sessions }: { sessions: Awaited<ReturnType<typeof getSessions>> }) {
  if (!sessions.length) return <p className="text-soft">ยังไม่มีคาบที่เรียนไปแล้ว</p>;
  return (
    <div className="grid">
      {sessions.map((s) => (
        <div key={s.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-t border-line py-2.5 text-[15px] tabular-nums first:border-t-0">
          <div className="min-w-0">
            คาบ {s.session_no} · {s.topic}
            <small className="block text-[13px] text-soft">{fmtDate(s.starts_at)}</small>
          </div>
          {s.leave ? <span className="pill-wait">ลา</span> : s.attendance ? (s.attendance.present ? <span className="pill-ok">มาเรียน</span> : <span className="pill-miss">ขาด</span>) : <span className="pill-wait">รอเช็กชื่อ</span>}
          <span className="min-w-8 text-right font-display font-semibold">{s.attendance?.focus_score ?? "–"}</span>
        </div>
      ))}
    </div>
  );
}

async function EnrollPanel({ child }: { child: Child }) {
  const { supabase } = await requireUser();
  const [{ data }, { data: bundle }] = await Promise.all([
    supabase
      .from("classes")
      .select("id, title, room, course:courses(name, level, price, sessions), first:class_sessions(starts_at)")
      .eq("age_group", child.age_group)
      .order("starts_at", { referencedTable: "class_sessions" })
      .limit(1, { referencedTable: "class_sessions" }),
    supabase.from("packages").select("price").eq("code", "bundle_l1_l3").maybeSingle(),
  ]);
  const classes = (data ?? []) as unknown as {
    id: string; title: string; room: string | null;
    course: { name: string; level: number; price: number; sessions: number };
    first: { starts_at: string }[];
  }[];

  return (
    <section className="panel" aria-labelledby="h-enroll">
      <h2 id="h-enroll" className="text-lg font-semibold">เลือกรอบเรียนให้{child.nickname}</h2>
      <p className="text-soft">รอบที่เปิดสำหรับกลุ่มอายุของ{child.nickname} เลือกแล้วระบบจะสร้างรายการชำระเงินให้</p>
      {classes.length === 0 && <p>ยังไม่มีรอบเรียนที่เปิดรับ ทีมงานจะติดต่อกลับทาง LINE</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {classes.map((c) => (
          <form key={c.id} action={enroll} className="grid gap-2 rounded-xl border border-line p-4">
            <input type="hidden" name="child_id" value={child.id} />
            <input type="hidden" name="class_id" value={c.id} />
            <b className="font-display text-[17px]">{c.title}</b>
            <span className="text-[15px] text-soft">
              {c.course.sessions} คาบ · {c.room} · เริ่ม {c.first[0] ? `${fmtDate(c.first[0].starts_at)} ${fmtTime(c.first[0].starts_at)}` : "เร็ว ๆ นี้"}
            </span>
            <span className="font-display text-2xl font-semibold tabular-nums">{c.course.price.toLocaleString("th-TH")} บาท</span>
            <div className="flex flex-wrap gap-2">
              <button type="submit" className="btn-primary">ลงทะเบียน {c.course.name.split(" ").slice(0, 2).join(" ")}</button>
              {c.course.level === 1 && bundle && (
                <button type="submit" name="bundle" value="1" className="btn-ghost">
                  ซื้อ Bundle Level 1–3 · {bundle.price.toLocaleString("th-TH")} บาท
                </button>
              )}
            </div>
          </form>
        ))}
      </div>
    </section>
  );
}
