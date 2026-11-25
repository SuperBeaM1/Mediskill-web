import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, SectionHead } from "@/components/SectionHead";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "หลักสูตร PAC'C",
  description: "หลักสูตรสมาธิ PAC'C จากผลการวิจัยระดับโลกจากญี่ปุ่น สำหรับทุกวัย 3 เลเวล 10–50 ชั่วโมง เรียนแบบ Hybrid ที่ศูนย์ ออนไลน์สด และฝึกที่บ้าน",
};

const LEVELS = [
  ["Level 1", "Awareness", "10 ชม.", "10 คาบ · ประมาณ 5 สัปดาห์", "รู้จักสมองตัวเอง และสัมผัส “ความนิ่ง” ครั้งแรก", "pre-test และ post-test ด้วยเกม + แบบสังเกตของครู"],
  ["Level 2", "Skill Building", "30 ชม.", "30 คาบ · ประมาณ 10–15 สัปดาห์", "ขยายความจำใช้งาน และดึงสมาธิกลับมาได้เมื่อถูกรบกวน", "คะแนนเกมรายสัปดาห์ + แบบประเมินของผู้ปกครอง"],
  ["Level 3", "Habit & Mastery", "50 ชม.", "50 คาบ · ประมาณ 6 เดือน", "สมาธิกลายเป็นนิสัยอัตโนมัติ และเป็นพี่เลี้ยงให้เพื่อนได้", "streak ในแอป, peer coaching และโปรเจกต์จบ"],
] as const;

const CLASS_FLOW = [
  ["Clean Start", "5", "จัดโต๊ะ วางของ และเช็กอินอารมณ์ด้วยหน้าอีโมจิในแอป", "C · Clean"],
  ["Breathe", "5–10", "หายใจตามแอนิเมชัน เด็กเล็กฝึก 3 นาที วัยรุ่นและผู้ใหญ่ฝึก 10 นาที", "A"],
  ["Brain Game", "15", "เกมฝึกสมองตามทักษะประจำคาบ", "P"],
  ["Move & Still", "10", "เคลื่อนไหวแล้วหยุดนิ่ง (Freeze) และเดินช้า", "A"],
  ["Create", "15", "งานสร้างสรรค์แบบจดจ่อ เช่น วาดภาพ ต่อบล็อก Scratch หรือ Python", "C · Creative"],
  ["Reflect", "5", "เล่าสิ่งที่ทำได้วันนี้ รับสติกเกอร์ และรับการบ้าน 5 นาที", "ทุกเสา"],
] as const;

const L1 = [
  ["สมองของฉันทำงานยังไง + pre-test", "ชุดเกมวัดผลเริ่มต้น", "วาดรูป “สมองของฉัน”"],
  ["ลมหายใจลูกโป่ง", "Breathing Bubble", "หายใจ 4-4"],
  ["ดูให้ดี จำให้ได้", "Memory Sequence (ง่าย)", "เกมของหายไปไหน"],
  ["หูไว ใจนิ่ง", "Sound Match", "ฟังเสียงระฆังจนเงียบ"],
  ["จัดโต๊ะ จัดใจ (Seiso)", "Tidy Room", "ภารกิจเก็บของ 5 นาที"],
  ["สีหลอกตา", "Color-Word Stroop (8+) / Shape Sort (5–7)", "Freeze dance"],
  ["หยุดก่อนคิด", "Go/No-Go", "เกม “ไซมอนบอกว่า”"],
  ["วาดอย่างจดจ่อ", "–", "ระบายสีแมนดาลา"],
  ["ช่วยเพื่อนจดจ่อ", "เล่นเป็นคู่", "สอนเพื่อนหายใจ"],
  ["post-test + ฉลองจบ", "ชุดเกมวัดผลซ้ำ", "ใบประกาศ + รายงานพัฒนาการ"],
] as const;

const HYBRID = [
  ["ที่ศูนย์ (ออนไซต์)", "เสาร์ 1 คาบ", ["วัดคลื่นสมองด้วย Muse S ตอน pre-test และ post-test", "ฝึก Seiso จัดพื้นที่จริง และ Move & Still", "กิจกรรมกลุ่ม peer coaching และงาน Monozukuri"]],
  ["ออนไลน์สด (Google Meet)", "พุธ 1 คาบ", ["ฝึกหายใจ Brain Game และ Reflect", "เช็กอินอารมณ์ และสอนเสริมกลางสัปดาห์", "ประชุมติดตามผลเดือนละครั้ง"]],
  ["ฝึกเองที่บ้าน", "5 วัน วันละ 15–20 นาที", ["เล่นเกมฝึกสมองในเว็บแอป", "ทำภารกิจที่บ้าน แล้วบันทึกผลในแอป", "ตั้งเวลาเล่นสูงสุดต่อวันได้"]],
] as const;

export default function CoursesPage() {
  return (
    <>
      <SiteHeader />
      <main className="wrap">
        <PageHero
          eyebrow="หลักสูตร PAC'C"
          title="ฝึกสมาธิ 3 เลเวล ตั้งแต่รู้จักความนิ่ง จนจดจ่อเป็นนิสัย"
          text="พัฒนาจากผลการวิจัยระดับโลกจากประเทศญี่ปุ่น ฝึกได้ทุกวัย เรียนแบบ Hybrid ที่ศูนย์สัปดาห์ละครั้ง ออนไลน์สดอีกครั้ง และฝึกต่อที่บ้านด้วยเกม คาบละ 60 นาที ปรับเนื้อหาตามช่วงวัย"
        >
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/trial" className="btn-primary">จองคลาสทดลอง</Link>
            <Link href="/#price" className="btn-ghost">ดูราคา</Link>
          </div>
        </PageHero>

        <section className="py-10">
          <SectionHead title="3 เลเวล" text="เริ่มจาก Level 1 ได้ทุกวัย ครูจะแนะนำเลเวลถัดไปจากรายงาน 6-I" />
          <div className="grid gap-4 md:grid-cols-3">
            {LEVELS.map(([lvl, name, hrs, when, goal, measure]) => (
              <article key={lvl} className="panel">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-display text-sm font-medium text-orange">{lvl}</span>
                  <span className="font-display text-[15px] text-soft tabular-nums">{hrs}</span>
                </div>
                <h3 className="text-[22px] font-semibold">{name}</h3>
                <p className="hint">{when}</p>
                <p className="text-[15px]">{goal}</p>
                <p className="mt-auto border-t border-dashed border-line pt-3 text-sm text-soft">
                  <b className="font-medium text-ink">วัดผล:</b> {measure}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="py-10">
          <SectionHead title="1 คาบ 60 นาที มีอะไรบ้าง" text="ทุกคาบฝึกครบ 4 เสาหลัก ปรับเวลาแต่ละช่วงตามอายุ" />
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CLASS_FLOW.map(([name, min, what, pillar], i) => (
              <li key={name} className="flex min-w-0 gap-4 rounded-xl border border-line bg-surface p-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-orange-tint font-display font-semibold text-orange">{i + 1}</span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <h3 className="text-lg font-semibold">{name}</h3>
                    <span className="text-sm text-soft tabular-nums">{min} นาที</span>
                  </div>
                  <p className="mt-1 text-[15px]">{what}</p>
                  <span className="pill-ok mt-2 inline-block">{pillar}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="py-10">
          <SectionHead title="เรียนแบบ Hybrid" text="ตัวอย่างตาราง 1 สัปดาห์ เด็ก 5–7 ปีเรียนออนไลน์ไม่เกิน 20–30 นาทีต่อครั้ง และมีผู้ปกครองนั่งด้วย วัยอื่นเรียนได้เต็มคาบ" />
          <div className="grid gap-4 md:grid-cols-3">
            {HYBRID.map(([where, when, items]) => (
              <article key={where} className="panel">
                <h3 className="text-xl font-semibold">{where}</h3>
                <span className="pill-wait w-fit">{when}</span>
                <ul className="list-disc pl-5 text-[15px] text-soft">
                  {items.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </article>
            ))}
          </div>
          <p className="hint mt-4">ห้องเรียนออนไลน์ใช้ลิงก์เฉพาะห้อง เปิดห้องรอ ปิดแชทส่วนตัว และบันทึกคลิปเฉพาะเมื่อผู้ปกครองยินยอม</p>
        </section>

        <section className="py-10">
          <SectionHead title="ตัวอย่าง Level 1 ทั้ง 10 คาบ" text="แต่ละคาบจับคู่เกมในแอปกับกิจกรรมนอกจอ" />
          <div className="overflow-x-auto rounded-xl border border-line bg-surface">
            <table className="w-full min-w-[560px] text-left text-[15px]">
              <thead className="border-b border-line text-sm text-soft">
                <tr>
                  <th className="px-4 py-3 font-medium">คาบ</th>
                  <th className="px-4 py-3 font-medium">หัวข้อ</th>
                  <th className="px-4 py-3 font-medium">เกมในแอป</th>
                  <th className="px-4 py-3 font-medium">กิจกรรมนอกจอ</th>
                </tr>
              </thead>
              <tbody>
                {L1.map(([topic, game, off], i) => (
                  <tr key={topic} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-display font-semibold tabular-nums">{i + 1}</td>
                    <td className="px-4 py-3">{topic}</td>
                    <td className="px-4 py-3 text-soft">{game}</td>
                    <td className="px-4 py-3 text-soft">{off}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/games" className="btn-ghost">ลองเล่นเกมฝึกสมอง</Link>
            <Link href="/report-6i" className="btn-ghost">ดูวิธีวัดผล 6-I</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
