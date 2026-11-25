import Link from "next/link";
import { BreathCircle } from "@/components/BreathCircle";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { SixIBars } from "@/components/SixIBars";
import { SectionHead } from "@/components/SectionHead";

const PILLARS = [
  ["P", "Program Medit Digital", "“อัปเกรดสมอง”: ความจำใช้งาน และการจดจ่อ", "เกมฝึกสมองในแอป"],
  ["A", "Art of Focus", "“ใจนิ่งเหมือนก้อนหิน”: สติ และการคุมอารมณ์", "หายใจลูกโป่ง 4-4, ฟังเสียงระฆังจนเงียบ"],
  ["C", "Clean Mindset", "“จัดห้อง จัดใจ”: วินัย และลดสิ่งรบกวน", "จัดโต๊ะก่อนเรียน, ภารกิจ 5 นาที"],
  ["C", "Creative Focus", "“จดจ่อแล้วสร้างสรรค์”: flow และความคิดสร้างสรรค์", "วาดแมนดาลา, Scratch, Python"],
] as const;

const AGES = [
  ["เด็ก", "5–12 ปี", "เรียนผ่านเกม นิทาน และการเคลื่อนไหว แบ่งกลุ่ม Seed, Sprout และ Tree ตามช่วงสมาธิ"],
  ["วัยรุ่น", "13–19 ปี", "จดจ่อกับการเรียน ลดสิ่งรบกวนจากจอ และรับมือความเครียดก่อนสอบ"],
  ["วัยทำงาน", "20–59 ปี", "โฟกัสงานลึกได้นานขึ้น คุมอารมณ์ และพักใจอย่างมีวินัย"],
  ["วัยเกษียณ", "60 ปีขึ้นไป", "ฝึกความจำและความใส่ใจ ใจนิ่งขึ้น และทำกิจกรรมสร้างสรรค์กับเพื่อนใหม่"],
] as const;

const ORIGIN = [
  ["งานวิจัยระดับโลกจากญี่ปุ่น", "หลักสูตร PAC'C พัฒนาจากผลการวิจัยระดับโลกจากประเทศญี่ปุ่น ว่าด้วยการฝึกสมาธิ ความจำใช้งาน และการควบคุมตนเอง"],
  ["แนวคิดแบบญี่ปุ่น", "Seiso จัดพื้นที่ จัดใจ และ Monozukuri ทำสิ่งตรงหน้าอย่างใส่ใจทีละขั้น"],
  ["วัดผลได้จริง", "ทุกการฝึกเก็บเป็นข้อมูล แล้วสรุปเป็นรายงาน 6-I ให้เห็นพัฒนาการเป็นตัวเลข"],
] as const;

const PLANS = [
  ["Level 1", "Awareness", "590", "10 ชม.", ["รู้จักสมาธิและการหายใจ", "เกมฝึกสมองในแอป", "รายงาน 6-I เดือนแรก"], false],
  ["Level 2 · ยอดนิยม", "Skill Building", "1,090", "30 ชม.", ["ฝึกจดจ่อต่อเนื่อง", "ภารกิจที่บ้านรายสัปดาห์", "ประชุมติดตามผล"], true],
  ["Level 3", "Habit & Mastery", "1,590", "50 ชม.", ["สร้างนิสัยจดจ่อระยะยาว", "โปรเจกต์สร้างสรรค์", "peer coaching"], false],
] as const;

const TRUST = [
  ["ครูผ่านการอบรม PAC'C", "ใช้คู่มือการสอนมาตรฐานเดียวกัน"],
  ["ที่ปรึกษาด้านจิตวิทยา", "ตรวจเนื้อหาและเกมทุกเลเวล"],
  ["รายงานทุกเดือน", "คะแนนจริงจากเกมและบันทึกครู"],
  ["ข้อมูลปลอดภัยตาม PDPA", "เก็บผู้เรียนแค่ชื่อเล่นกับปีเกิด"],
] as const;

const SAMPLE_6I: [string, number, number][] = [
  ["IQ", 62, 70], ["EF", 55, 66], ["EQ", 68, 72], ["AQ", 50, 58], ["MQ", 60, 64], ["SQ", 58, 67],
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="wrap">
        <section className="grid items-center gap-12 py-12 md:grid-cols-[1.1fr_.9fr] md:py-16">
          <div>
            <span className="eyebrow">ศูนย์พัฒนาทักษะสมาธิ สำหรับทุกวัย</span>
            <h1 className="mt-4 text-[clamp(32px,4.4vw,48px)] font-bold tracking-tight">
              สมาธิ คือ
              <br />
              <em className="text-orange not-italic">นวัตกรรมของชีวิต</em>
            </h1>
            <p className="mt-4 max-w-[34em] text-lg text-soft">
              หลักสูตร PAC&apos;C พัฒนาจากผลการวิจัยระดับโลกจากประเทศญี่ปุ่น ฝึกได้ทุกวัย ตั้งแต่เด็กจนถึงวัยเกษียณ
              ผสมการฝึกในห้อง ออนไลน์สด และเกมฝึกสมองวันละ 15–20 นาที แล้วสรุปพัฒนาการเป็นรายงาน 6-I ทุกเดือน
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/trial" className="btn-primary">จองคลาสทดลอง</Link>
              <Link href="/courses" className="btn-ghost">ดูหลักสูตร</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-7 text-sm text-soft">
              {[["3", "เลเวล 10–50 ชม."], ["8", "เกมฝึกสมอง"], ["6", "ด้านในรายงาน 6-I"]].map(([n, t]) => (
                <div key={t}>
                  <b className="block font-display text-2xl font-semibold text-ink tabular-nums">{n}</b>
                  {t}
                </div>
              ))}
            </div>
          </div>
          <BreathCircle />
        </section>

        <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-line bg-surface lg:grid-cols-4" aria-label="จุดที่มั่นใจได้">
          {TRUST.map(([t, s], i) => (
            <div key={t} className={`grid min-w-0 gap-0.5 px-5 py-4 ${i % 2 ? "border-l border-line" : ""} ${i >= 2 ? "border-t border-line lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}>
              <b className="font-display text-[15px] font-semibold">{t}</b>
              <span className="text-[13px] text-soft">{s}</span>
            </div>
          ))}
        </div>

        <section className="pt-14">
          <div className="grid gap-8 rounded-2xl border border-line bg-surface p-6 md:grid-cols-[.9fr_1.1fr] md:p-8">
            <div>
              <span className="eyebrow">ที่มาของ PAC&apos;C</span>
              <h2 className="mt-3.5 text-[clamp(24px,3vw,32px)] font-semibold">พัฒนาจากผลการวิจัยระดับโลกจากญี่ปุ่น</h2>
              <p className="mt-3 text-soft">เพราะสมาธิ คือ นวัตกรรมของชีวิต ทักษะเดียวที่ทำให้ทุกอย่างในชีวิตดีขึ้น ตั้งแต่การเรียน การทำงาน ไปจนถึงการใช้ชีวิตหลังเกษียณ</p>
            </div>
            <ul className="grid gap-4">
              {ORIGIN.map(([t, d]) => (
                <li key={t} className="flex gap-3.5">
                  <span className="mt-2 size-2.5 shrink-0 rounded-full bg-orange" aria-hidden="true" />
                  <div>
                    <b className="font-display text-[17px] font-semibold">{t}</b>
                    <p className="text-[15px] text-soft">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="pillars" className="scroll-mt-20 py-14">
          <SectionHead title="4 เสาหลักของ PAC'C" text="ทุกคาบฝึกครบ 4 ด้าน ปรับภาษาและกิจกรรมให้เหมาะกับแต่ละวัย" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map(([l, t, k, a]) => (
              <article key={t} className="flex min-w-0 flex-col gap-2.5 rounded-xl border border-line bg-surface p-5">
                <div className="grid size-11 place-items-center rounded-[10px] bg-brand-tint font-display text-xl font-semibold text-brand">{l}</div>
                <h3 className="text-[19px] font-semibold">{t}</h3>
                <p className="text-sm text-soft">{k}</p>
                <p className="mt-auto border-t border-dashed border-line pt-2.5 text-sm">{a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="py-14">
          <SectionHead title="ฝึกได้ทุกวัย" text="เนื้อหาและเกมปรับตามช่วงชีวิต ระบบจัดกลุ่มให้อัตโนมัติจากปีเกิด" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AGES.map(([t, y, d]) => (
              <article key={t} className="min-w-0 rounded-xl border border-line bg-surface p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-[22px] font-semibold">{t}</h3>
                  <span className="font-display text-[15px] text-soft">{y}</span>
                </div>
                <p className="mt-3 text-[15px]">{d}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="report" className="scroll-mt-20 py-14">
          <div className="grid items-center gap-8 rounded-2xl border border-line bg-surface p-6 md:grid-cols-[.9fr_1.1fr] md:p-8">
            <div>
              <span className="eyebrow">ตัวอย่างรายงาน</span>
              <h2 className="mt-3.5 text-[clamp(24px,3vw,32px)] font-semibold">รายงาน 6-I รายเดือน</h2>
              <p className="mt-3 text-soft">ระบบรวมคะแนนจากเกมและบันทึกของครู เทียบกับเดือนก่อน เปิดดูได้ในแอป</p>
            </div>
            <SixIBars rows={SAMPLE_6I} label="ตัวอย่างคะแนน 6-I เดือนนี้เทียบเดือนก่อน" />
          </div>
        </section>

        <section id="price" className="scroll-mt-20 py-14">
          <SectionHead title="เลือกเลเวลที่เหมาะกับคุณ" text="เริ่มจาก Level 1 ได้ทุกวัย ครูจะแนะนำเลเวลถัดไปจากรายงาน" />
          <div className="grid gap-4 md:grid-cols-3">
            {PLANS.map(([lvl, name, price, hrs, items, hot]) => (
              <article key={name} className={`flex min-w-0 flex-col gap-3 rounded-xl bg-surface p-6 ${hot ? "border-2 border-brand shadow-lg shadow-ink/5" : "border border-line"}`}>
                <span className="font-display text-sm font-medium text-brand">{lvl}</span>
                <h3 className="text-[21px] font-semibold">{name}</h3>
                <p className="font-display text-[34px] font-semibold tabular-nums">
                  {price} <small className="font-sans text-[15px] font-normal text-soft">บาท / {hrs}</small>
                </p>
                <ul className="list-disc pl-5 text-[15px] text-soft">
                  {items.map((i) => <li key={i}>{i}</li>)}
                </ul>
                <Link href="/register" className={`${hot ? "btn-primary" : "btn-ghost"} mt-auto`}>สมัคร {lvl.split(" ·")[0]}</Link>
              </article>
            ))}
          </div>
          <div className="mt-4 grid gap-3 rounded-xl border border-line bg-surface p-5 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <b className="font-display text-lg">Bundle Level 1–3 · 2,590 บาท</b>
              <p className="text-[15px] text-soft">90 ชม. ครบ 3 เลเวล จ่ายครั้งเดียว ถูกกว่าซื้อแยก 680 บาท</p>
            </div>
            <Link href="/register" className="btn-primary">สมัคร Bundle</Link>
          </div>
          <p className="mt-3.5 text-[13px] text-soft">แอปรายเดือน (เกมและรายงาน) 59 บาทต่อผู้เรียน 1 คน · แพ็กเกจโรงเรียน 7,900 บาทต่อห้อง (ไม่เกิน 30 คน)</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
