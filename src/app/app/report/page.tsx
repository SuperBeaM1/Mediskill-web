import type { Metadata } from "next";
import { ChildSwitcher, PageHead } from "@/components/ChildSwitcher";
import { SixIBars } from "@/components/SixIBars";
import { SixIRadar } from "@/components/SixIRadar";
import { getFamily } from "@/lib/data";
import { nowMs } from "@/lib/format";
import { computeSixI, lastMonths, loadSixIData, SIX_KEYS, SIX_LABEL } from "@/lib/sixI";
import { requireUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "รายงาน 6-I" };

const TH_MONTH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const monthLabel = (k: string) => `${TH_MONTH[Number(k.slice(5)) - 1]} ${(Number(k.slice(0, 4)) + 543) % 100}`;

export default async function ReportPage({ searchParams }: PageProps<"/app/report">) {
  const sp = await searchParams;
  const { supabase } = await requireUser();
  const { kids, current } = await getFamily(supabase, typeof sp.child === "string" ? sp.child : undefined);
  if (!current) return <PageHead title="รายงาน 6-I" sub="ยังไม่มีผู้เรียนในบัญชีนี้ เพิ่มได้ที่หน้าภาพรวม" />;

  const months = lastMonths(nowMs(), 6);
  const { rounds, calls } = await loadSixIData(supabase, current.id, `${months[0]}-01T00:00:00+07:00`);
  const byMonth = months.map((m) => ({ month: m, ...computeSixI(rounds, calls, m) }));
  const cur = byMonth[5];
  const prev = byMonth[4];
  const hasData = SIX_KEYS.some((k) => cur.scores[k] != null);

  return (
    <>
      <PageHead title="รายงาน 6-I" sub={`${current.nickname} · เดือน${monthLabel(cur.month)} เทียบ${monthLabel(prev.month)} · คำนวณอัตโนมัติจากเกมและการเช็กชื่อ`}>
        <ChildSwitcher kids={kids} current={current} base="/app/report" />
      </PageHead>

      {!hasData && (
        <p className="panel text-soft">ยังไม่มีข้อมูลเดือนนี้ เล่นเกมฝึกสมองในเมนู “เกม” หรือเข้าเรียนกับครู แล้วรายงานจะขึ้นอัตโนมัติ</p>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="panel" aria-labelledby="h-radar">
          <h2 id="h-radar" className="text-lg font-semibold">ภาพรวม 6 ด้าน</h2>
          <SixIRadar
            now={SIX_KEYS.map((k) => cur.scores[k])}
            prev={SIX_KEYS.map((k) => prev.scores[k])}
            label={`กราฟเรดาร์ 6-I ของ${current.nickname} เดือนนี้เทียบเดือนก่อน`}
          />
          <div className="flex justify-center gap-5 text-[13px] text-soft">
            <span><i className="mr-1.5 inline-block h-0.5 w-5 bg-brand align-middle" />เดือนนี้</span>
            <span><i className="mr-1.5 inline-block h-0.5 w-5 border-t-2 border-dashed border-soft align-middle" />เดือนก่อน</span>
          </div>
        </section>
        <section className="panel" aria-labelledby="h-bars">
          <h2 id="h-bars" className="text-lg font-semibold">คะแนนเทียบเดือนก่อน</h2>
          <SixIBars
            rows={SIX_KEYS.map((k) => [k.toUpperCase(), prev.scores[k], cur.scores[k]] as [string, number | null, number | null])}
            label={`คะแนน 6-I ของ${current.nickname}`}
          />
        </section>
      </div>

      <section className="panel" aria-labelledby="h-basis">
        <h2 id="h-basis" className="text-lg font-semibold">คะแนนแต่ละด้านมาจากไหน</h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {SIX_KEYS.map((k) => (
            <li key={k} className="flex gap-3 rounded-[10px] border border-line p-3.5">
              <span className="grid size-11 flex-none place-items-center rounded-[10px] bg-brand-tint font-display font-semibold text-brand">{k.toUpperCase()}</span>
              <div className="min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <b className="font-medium">{SIX_LABEL[k]}</b>
                  <span className="font-display text-lg font-semibold tabular-nums">{cur.scores[k] ?? "–"}</span>
                </div>
                <p className="hint">{cur.basis[k]}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel" aria-labelledby="h-trend">
        <h2 id="h-trend" className="text-lg font-semibold">แนวโน้ม 6 เดือน</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-center text-[15px] tabular-nums">
            <thead className="border-b border-line text-sm text-soft">
              <tr>
                <th className="py-2 text-left font-medium">ด้าน</th>
                {byMonth.map((m) => (
                  <th key={m.month} className="py-2 font-medium">{monthLabel(m.month)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SIX_KEYS.map((k) => (
                <tr key={k} className="border-b border-line last:border-0">
                  <th scope="row" className="py-2.5 text-left font-display font-semibold">{k.toUpperCase()}</th>
                  {byMonth.map((m, i) => {
                    const v = m.scores[k];
                    const before = i > 0 ? byMonth[i - 1].scores[k] : null;
                    const up = v != null && before != null && v > before;
                    const down = v != null && before != null && v < before;
                    return (
                      <td key={m.month} className="py-2.5">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="inline-block h-1.5 w-8 overflow-hidden rounded-full bg-bg" aria-hidden="true">
                            <span className="block h-full rounded-full bg-brand" style={{ width: `${v ?? 0}%` }} />
                          </span>
                          {v ?? "–"}
                          {up && <span className="text-xs text-brand" aria-label="เพิ่มขึ้น">▲</span>}
                          {down && <span className="text-xs text-coral" aria-label="ลดลง">▼</span>}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hint">คะแนนเต็ม 100 ทุกด้าน เทียบกับตัวเองเท่านั้น ไม่เทียบกับผู้เรียนคนอื่น · “–” คือข้อมูลเดือนนั้นยังไม่พอ</p>
      </section>
    </>
  );
}
