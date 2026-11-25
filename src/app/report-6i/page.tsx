import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, SectionHead } from "@/components/SectionHead";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { SixIBars } from "@/components/SixIBars";

export const metadata: Metadata = {
  title: "รายงาน 6-I",
  description: "รายงานพัฒนาการ 6 ด้าน (IQ, EF, EQ, AQ, MQ, SQ) รายเดือน จากคะแนนเกมและบันทึกของครู",
};

const SIX_I = [
  ["IQ", "ตรรกะและความจำ", "คะแนน Memory Sequence และ Pattern Next"],
  ["EF", "การยับยั้งตัวเอง ความยืดหยุ่นของความคิด และความจำใช้งาน", "Go/No-Go, Stroop และ Task Switch"],
  ["EQ", "รู้จักและคุมอารมณ์ตัวเอง", "เช็กอินอารมณ์ต้นคาบ และแบบสังเกตของครู"],
  ["AQ", "ความอดทน และลุกขึ้นใหม่หลังทำพลาด", "จำนวนครั้งที่เล่นซ้ำหลังแพ้ และเวลาจดจ่อ"],
  ["MQ", "วินัยและคุณธรรม", "streak การฝึก และภารกิจ Seiso ที่บ้านที่ยืนยันในแอป"],
  ["SQ", "ทักษะสังคมและภาวะผู้นำ", "peer coaching และกิจกรรมกลุ่ม ครูเป็นผู้ให้คะแนน"],
] as const;

const SAMPLE: [string, number, number][] = [
  ["IQ", 62, 70], ["EF", 55, 66], ["EQ", 68, 72], ["AQ", 50, 58], ["MQ", 60, 64], ["SQ", 58, 67],
];

const SOURCES = [
  ["เกมในแอป", "คะแนน ความแม่นยำ และความไวจากทุกรอบที่เล่น"],
  ["ครูประจำคลาส", "บันทึกพฤติกรรมและคะแนนจดจ่อหลังทุกคาบ ทั้งที่ศูนย์และออนไลน์"],
  ["ผู้เรียนและครอบครัว", "ยืนยันภารกิจที่บ้าน และตอบแบบประเมินสั้น ๆ"],
] as const;

const STEPS = [
  ["ต้นคอร์ส", "pre-test ด้วยชุดเกมวัดผล และวัดคลื่นสมองด้วย Muse S ที่ศูนย์"],
  ["ทุกเดือน", "ระบบรวมคะแนนเป็นรายงาน เทียบเดือนก่อนกับเดือนนี้ เปิดดูได้ในแอป"],
  ["ประชุมติดตามผล", "ครูอธิบายผลผ่าน Google Meet และแนะนำสิ่งที่ฝึกต่อที่บ้าน"],
  ["จบเลเวล", "post-test ชุดเดิม รับใบประกาศ และคำแนะนำเลเวลถัดไป"],
] as const;

export default function ReportPage() {
  return (
    <>
      <SiteHeader />
      <main className="wrap">
        <PageHero
          eyebrow="วัดผลได้จริง"
          title="รายงาน 6-I เห็นพัฒนาการเป็นตัวเลขทุกเดือน"
          text="รวมคะแนนจากเกม บันทึกของครู และภารกิจที่บ้าน แล้วสรุปเป็น 6 ด้าน เทียบกับเดือนก่อน ไม่เทียบกับเด็กคนอื่น"
        />

        <section className="grid items-center gap-8 rounded-2xl border border-line bg-surface p-6 md:grid-cols-[.9fr_1.1fr] md:p-8">
          <div>
            <span className="eyebrow">ตัวอย่างรายงาน</span>
            <h2 className="mt-3.5 text-[clamp(22px,2.6vw,28px)] font-semibold">น้องมะลิ · Level 1 เดือนที่ 2</h2>
            <p className="mt-3 text-soft">แถบสีเทาคือเดือนก่อน แถบสีน้ำเงินคือเดือนนี้ ตัวเลขด้านขวาคือคะแนนที่เพิ่มขึ้น (เต็ม 100)</p>
            <p className="hint mt-3">ข้อมูลตัวอย่าง ไม่ใช่ผลของผู้เรียนจริง</p>
          </div>
          <SixIBars rows={SAMPLE} label="ตัวอย่างคะแนน 6-I เดือนนี้เทียบเดือนก่อน" />
        </section>

        <section className="py-14">
          <SectionHead title="6 ด้านวัดจากอะไร" text="ทุกด้านมาจากข้อมูลที่เก็บได้จริง ไม่ใช่การเดา" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SIX_I.map(([k, mean, src]) => (
              <article key={k} className="panel">
                <div className="flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-[10px] bg-brand-tint font-display text-lg font-semibold text-brand">{k}</span>
                  <h3 className="text-[17px] font-semibold">{mean}</h3>
                </div>
                <p className="mt-auto border-t border-dashed border-line pt-3 text-sm text-soft">
                  <b className="font-medium text-ink">วัดจาก:</b> {src}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="py-4">
          <SectionHead title="ข้อมูลมาจาก 3 ทาง" text="ครูและที่ปรึกษาสุ่มตรวจรายงานทุกเดือน" />
          <div className="grid gap-4 md:grid-cols-3">
            {SOURCES.map(([who, what]) => (
              <article key={who} className="panel">
                <h3 className="text-lg font-semibold">{who}</h3>
                <p className="text-[15px] text-soft">{what}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="py-14">
          <SectionHead title="รายงานเดินทางยังไง" text="ตั้งแต่วันแรกจนจบเลเวล" />
          <ol className="grid gap-4 md:grid-cols-4">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="panel">
                <span className="font-display text-sm font-medium text-orange">ขั้นที่ {i + 1}</span>
                <h3 className="text-lg font-semibold">{t}</h3>
                <p className="text-[15px] text-soft">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="pb-6">
          <div className="grid gap-4 rounded-2xl border border-line bg-surface p-6 sm:grid-cols-[1fr_auto] sm:items-center md:p-8">
            <div>
              <h2 className="text-xl font-semibold">ใครเห็นข้อมูลของผู้เรียนได้บ้าง</h2>
              <p className="mt-2 text-[15px] text-soft">
                เจ้าของบัญชีเห็นเฉพาะผู้เรียนในบัญชีตัวเอง และขอลบได้ ครูเห็นเฉพาะผู้เรียนในคลาสที่สอน ที่ปรึกษาเห็นแบบไม่ระบุตัวตน
                เว้นแต่ผู้เรียนหรือครอบครัวยินยอมให้ปรึกษาเป็นรายเคส ฝ่ายการเงินเห็นยอดชำระแต่ไม่เห็นคะแนน
              </p>
            </div>
            <Link href="/register" className="btn-primary">เริ่มวัดผลของคุณ</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
