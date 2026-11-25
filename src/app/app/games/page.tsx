import type { Metadata } from "next";
import { ChildSwitcher, PageHead } from "@/components/ChildSwitcher";
import { GameHub } from "@/components/games/GameHub";
import { getFamily } from "@/lib/data";
import { bkkParts, fmtDate, fmtTime } from "@/lib/format";
import { requireUser } from "@/lib/supabase/server";
import { saveGameSession } from "./actions";

export const metadata: Metadata = { title: "เกมฝึกสมาธิ" };

type Row = {
  id: string;
  score: number;
  level: number;
  accuracy: number | null;
  reaction_ms: number | null;
  duration_s: number;
  created_at: string;
  game: { name: string } | null;
};

export default async function AppGamesPage({ searchParams }: PageProps<"/app/games">) {
  const sp = await searchParams;
  const { supabase } = await requireUser();
  const { kids, current } = await getFamily(supabase, typeof sp.child === "string" ? sp.child : undefined);
  if (!current) return <PageHead title="เกมฝึกสมาธิ" sub="ยังไม่มีผู้เรียนในบัญชีนี้ เพิ่มได้ที่หน้าภาพรวม" />;

  const dayStart = `${bkkParts(new Date()).key}T00:00:00+07:00`;
  const [{ data: today }, { data: recent }] = await Promise.all([
    supabase.from("game_sessions").select("duration_s").eq("child_id", current.id).gte("created_at", dayStart),
    supabase
      .from("game_sessions")
      .select("id, score, level, accuracy, reaction_ms, duration_s, created_at, game:games(name)")
      .eq("child_id", current.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);
  const usedMin = Math.floor((today ?? []).reduce((a, r) => a + (r.duration_s as number), 0) / 60);
  const left = Math.max(current.daily_limit_min - usedMin, 0);
  const rows = (recent ?? []) as unknown as Row[];

  async function save(run: Parameters<typeof saveGameSession>[1]) {
    "use server";
    return saveGameSession(current!.id, run);
  }

  return (
    <>
      <PageHead title="เกมฝึกสมาธิ" sub={`${current.nickname} เล่นวันนี้ไปแล้ว ${usedMin} นาที เหลือ ${left} จาก ${current.daily_limit_min} นาที`}>
        <ChildSwitcher kids={kids} current={current} base="/app/games" />
      </PageHead>

      <GameHub onSave={save} locked={left === 0 ? `ครบเวลาเล่นของวันนี้แล้ว (${current.daily_limit_min} นาที) พรุ่งนี้มาเล่นต่อนะ` : null} />

      <section className="panel mt-6">
        <h2 className="text-xl font-semibold">ประวัติ 10 รอบล่าสุด</h2>
        {rows.length === 0 ? (
          <p className="hint">ยังไม่มีคะแนน เล่นจบ 1 รอบแล้วคะแนนจะขึ้นที่นี่</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-[15px] tabular-nums">
              <thead className="border-b border-line text-sm text-soft">
                <tr>
                  <th className="py-2 pr-4 font-medium">เมื่อ</th>
                  <th className="py-2 pr-4 font-medium">เกม</th>
                  <th className="py-2 pr-4 font-medium">คะแนน</th>
                  <th className="py-2 pr-4 font-medium">แม่นยำ</th>
                  <th className="py-2 pr-4 font-medium">ความไว</th>
                  <th className="py-2 font-medium">เวลา</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-0">
                    <td className="py-2 pr-4 text-soft">{fmtDate(r.created_at)} {fmtTime(r.created_at)}</td>
                    <td className="py-2 pr-4">{r.game?.name ?? "–"}</td>
                    <td className="py-2 pr-4 font-semibold">{r.score}</td>
                    <td className="py-2 pr-4">{r.accuracy != null ? `${Number(r.accuracy)}%` : "–"}</td>
                    <td className="py-2 pr-4">{r.reaction_ms != null ? `${r.reaction_ms} ms` : "–"}</td>
                    <td className="py-2">{Math.ceil(r.duration_s / 60)} นาที</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
