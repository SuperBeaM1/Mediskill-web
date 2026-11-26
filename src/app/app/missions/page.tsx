import type { Metadata } from "next";
import Link from "next/link";
import { ChildSwitcher, PageHead } from "@/components/ChildSwitcher";
import { getFamily } from "@/lib/data";
import { nowMs } from "@/lib/format";
import { BADGES, dayStats, lastDays, missionsFor, streakOf } from "@/lib/missions";
import { requireUser } from "@/lib/supabase/server";
import { toggleMission } from "../actions";

export const metadata: Metadata = { title: "ภารกิจประจำวัน" };

const DOW = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

function Star({ on, className = "size-5" }: { on: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2.8l2.8 5.7 6.3.9-4.6 4.4 1.1 6.2L12 17l-5.6 3 1.1-6.2L2.9 9.4l6.3-.9z"
        fill={on ? "#F5A800" : "none"}
        stroke={on ? "#F5A800" : "var(--line)"}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Flame({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 2c1 3.5 5 5.6 5 10.5A5 5 0 0 1 7 12.5c0-2 1-3.4 2-4.5.3 1.6 1.2 2.6 2.2 3C10.6 8.3 11 5 12 2z" fill="#F27A12" />
      <path d="M12 21a3 3 0 0 1-3-3c0-1.6 1.2-2.5 2-3.6.4 1 1.1 1.5 1.8 1.8.7.3 1.2 1 1.2 1.8a3 3 0 0 1-2 3z" fill="#FFD27A" />
    </svg>
  );
}

export default async function MissionsPage({ searchParams }: PageProps<"/app/missions">) {
  const sp = await searchParams;
  const { supabase } = await requireUser();
  const { kids, current } = await getFamily(supabase, typeof sp.child === "string" ? sp.child : undefined);
  if (!current) return <PageHead title="ภารกิจประจำวัน" sub="ยังไม่มีผู้เรียนในบัญชีนี้ เพิ่มได้ที่หน้าภาพรวม" />;

  const days = lastDays(nowMs(), 365);
  const from = `${days[0]}T00:00:00+07:00`;
  const [{ data: g }, { data: c }] = await Promise.all([
    supabase.from("game_sessions").select("created_at, game:games(code)").eq("child_id", current.id).gte("created_at", from),
    supabase.from("mission_checks").select("day, code").eq("child_id", current.id).gte("day", days[0]),
  ]);
  const rounds = ((g ?? []) as unknown as { created_at: string; game: { code: string } | null }[]).map((r) => ({ created_at: r.created_at, code: r.game?.code ?? "" }));
  const stats = dayStats(days, rounds, (c ?? []) as { day: string; code: string }[], current.age_group);

  const today = stats[stats.length - 1];
  const missions = missionsFor(today.day, current.age_group);
  const streak = streakOf(stats);
  const totalStars = stats.reduce((a, d) => a + d.stars, 0);
  const week = stats.slice(-7);
  const q = `?child=${current.id}`;

  return (
    <>
      <PageHead title={`ภารกิจของ${current.nickname}`} sub={`ทำครบ 3 ภารกิจวันนี้ ได้ ${3 + 2} ดาว`}>
        <ChildSwitcher kids={kids} current={current} base="/app/missions" />
      </PageHead>

      <div className="grid grid-cols-3 gap-3">
        <div className="grid justify-items-center gap-1 rounded-2xl border border-line bg-surface p-4 text-center">
          <Flame />
          <b className="font-display text-[clamp(26px,4vw,36px)] leading-none font-bold tabular-nums">{streak}</b>
          <span className="hint">วันต่อเนื่อง</span>
        </div>
        <div className="grid justify-items-center gap-1 rounded-2xl border border-line bg-surface p-4 text-center">
          <Star on className="size-8" />
          <b className="font-display text-[clamp(26px,4vw,36px)] leading-none font-bold tabular-nums">{today.stars}</b>
          <span className="hint">ดาววันนี้</span>
        </div>
        <div className="grid justify-items-center gap-1 rounded-2xl border border-line bg-surface p-4 text-center">
          <Star on className="size-8" />
          <b className="font-display text-[clamp(26px,4vw,36px)] leading-none font-bold tabular-nums">{totalStars}</b>
          <span className="hint">ดาวสะสม</span>
        </div>
      </div>

      <section className="grid gap-3" aria-labelledby="h-today">
        <h2 id="h-today" className="text-xl font-semibold">ภารกิจวันนี้ <span className="text-base font-normal text-soft">({today.done.length}/3)</span></h2>
        <ol className="grid gap-3 md:grid-cols-3">
          {missions.map((m, i) => {
            const done = today.done.includes(m.code);
            return (
              <li key={m.code} className={`flex flex-col gap-3 rounded-2xl border-2 p-5 transition ${done ? "border-brand bg-brand-tint" : "border-line bg-surface"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className={`grid size-10 place-items-center rounded-full font-display text-lg font-bold ${done ? "bg-brand text-brand-ink" : "bg-orange-tint text-orange"}`} aria-hidden="true">
                    {done ? "✓" : i + 1}
                  </span>
                  <Star on={done} className="size-7" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{m.title}</h3>
                  <p className="text-[15px] text-soft">{m.detail}</p>
                </div>
                <div className="mt-auto">
                  {m.kind === "offscreen" ? (
                    <form action={toggleMission}>
                      <input type="hidden" name="child_id" value={current.id} />
                      <input type="hidden" name="code" value={m.code} />
                      <input type="hidden" name="done" value={done ? "1" : "0"} />
                      <button className={`${done ? "btn-ghost" : "btn-primary"} w-full`}>{done ? "ยกเลิก (ยังไม่ได้ทำ)" : "ทำแล้ว"}</button>
                    </form>
                  ) : done ? (
                    <p className="font-medium text-brand">สำเร็จแล้ว</p>
                  ) : (
                    <Link href={`/app/games${q}`} className="btn-primary w-full">{m.kind === "breath" ? "ไปฝึกหายใจ" : "ไปเล่นเกม"}</Link>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        {today.done.length === 3 && (
          <p role="status" className="rounded-xl bg-sun-tint px-4 py-3 text-center font-display text-lg font-semibold text-sun">ครบ 3 ภารกิจแล้ว รับโบนัส +2 ดาว เก่งมาก!</p>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="panel" aria-labelledby="h-week">
          <h2 id="h-week" className="text-lg font-semibold">7 วันล่าสุด</h2>
          <ol className="grid grid-cols-7 gap-1.5 text-center">
            {week.map((d) => (
              <li key={d.day} className={`grid justify-items-center gap-1 rounded-[10px] py-2.5 ${d.done.length ? "bg-brand-tint" : "bg-mute"}`}>
                <span className="text-xs text-soft">{DOW[new Date(`${d.day}T00:00:00Z`).getUTCDay()]}</span>
                <Star on={d.stars > 0} />
                <b className="text-sm tabular-nums">{d.stars}</b>
              </li>
            ))}
          </ol>
        </section>

        <section className="panel" aria-labelledby="h-badge">
          <h2 id="h-badge" className="text-lg font-semibold">เหรียญรางวัล</h2>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3">
            {BADGES.map(([id, label, test]) => {
              const got = test(streak, totalStars);
              return (
                <li key={id} className={`grid justify-items-center gap-1.5 rounded-[10px] p-2.5 text-center ${got ? "" : "opacity-45"}`}>
                  <span className={`grid size-12 place-items-center rounded-full ${got ? "bg-[radial-gradient(circle,#FFE9D2_0%,#FDA85A_55%,#F27A12_100%)]" : "border-2 border-dashed border-line"}`}>
                    <Star on={got} className="size-6" />
                  </span>
                  <span className="text-xs font-medium">{label}</span>
                  <span className="sr-only">{got ? "ได้แล้ว" : "ยังไม่ได้"}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
}
