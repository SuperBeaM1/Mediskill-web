import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LINE_URL } from "@/components/SiteHeader";
import { PageHero, SectionHead } from "@/components/SectionHead";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา",
  description: "MeditSkill ศูนย์พัฒนาทักษะสมาธิสำหรับทุกวัย ทีมครู PAC'C และคณะที่ปรึกษาด้านจิตวิทยา",
};

const VALUES = [
  ["ฝึกทักษะ ไม่ใช่รักษา", "เราเป็นศูนย์ฝึกทักษะสมาธิ ถ้าพบสัญญาณที่ควรพบผู้เชี่ยวชาญ ครูจะแจ้งผู้ปกครองและแนะนำการส่งต่อ"],
  ["แข่งกับตัวเองเมื่อวาน", "ไม่จัดอันดับผู้เรียน ไม่มีกระดานคะแนนสาธารณะ รายงานเทียบกับเดือนก่อนของผู้เรียนคนนั้นเท่านั้น"],
  ["เก็บข้อมูลเท่าที่จำเป็น", "เก็บแค่ชื่อเล่นกับปีเกิดของผู้เรียน ตาม PDPA และขอลบข้อมูลได้ทุกเมื่อ"],
] as const;

const TEAM = [
  ["ครูและโค้ช PAC'C", "สอนที่ศูนย์และออนไลน์ บันทึกผลทุกคาบ สังเกตพฤติกรรม และประชุมกับผู้เรียนหรือครอบครัว"],
  ["ฝ่ายวิชาการ", "ออกแบบหลักสูตรตามช่วงวัย แผนการสอน เกณฑ์ 6-I และตรวจคุณภาพเกม"],
  ["ฝ่ายดูแลผู้เรียน", "ตอบ LINE OA จัดตารางเรียน ส่งรายงาน และรับฟังความเห็น"],
  ["ฝ่ายเทคโนโลยี", "พัฒนาเว็บแอป เกมฝึกสมอง ระบบรายงาน และดูแลความปลอดภัยของข้อมูล"],
] as const;

const ADVISORS = [
  ["Level 1 · Awareness", "นักจิตวิทยาพัฒนาการ", "ดูความเหมาะสมของกิจกรรมตามวัย และคัดกรองผู้เรียนที่ควรส่งต่อผู้เชี่ยวชาญ"],
  ["Level 2 · Skill Building", "นักจิตวิทยาการศึกษา / นักประสาทวิทยาศาสตร์การรับรู้", "ตรวจเกมฝึกสมอง การแปลผลคลื่นสมอง และเกณฑ์ด้าน EF และ IQ"],
  ["Level 3 · Habit & Mastery", "โค้ชภาวะผู้นำ และผู้เชี่ยวชาญ Creative Computing", "ดูแล peer coaching โปรเจกต์ Scratch/Python และแนวคิด Seiso/Monozukuri"],
  ["ทุกเลเวล", "นักจิตวิทยาคลินิก และที่ปรึกษา PDPA", "รับเคสพิเศษและการส่งต่อ ดูแลจริยธรรมและความเป็นส่วนตัวของข้อมูล"],
] as const;

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="wrap">
        <PageHero
          eyebrow="เกี่ยวกับ MeditSkill"
          title="สมาธิ คือ นวัตกรรมของชีวิต"
          text="MeditSkill ศูนย์พัฒนาทักษะสมาธิเมดิทสกิล สอนทุกวัย ตั้งแต่เด็กจนถึงวัยเกษียณ ด้วยหลักสูตร PAC'C ที่พัฒนาจากผลการวิจัยระดับโลกจากประเทศญี่ปุ่น ผสมการฝึกในห้อง ออนไลน์สด และเกมที่บ้าน แล้ววัดผลให้ผู้ปกครองเห็นจริงทุกเดือน"
        />

        <section className="grid gap-4 md:grid-cols-3">
          {VALUES.map(([t, d]) => (
            <article key={t} className="panel">
              <span className="h-1 w-10 rounded-full bg-orange" aria-hidden="true" />
              <h2 className="text-xl font-semibold">{t}</h2>
              <p className="text-[15px] text-soft">{d}</p>
            </article>
          ))}
        </section>

        <section className="py-14">
          <SectionHead title="ครูผู้สอนและที่ปรึกษา" text="ดูแลการสอนและมาตรฐานหลักสูตร PAC'C ทุกเลเวล" />
          <article className="grid overflow-hidden rounded-2xl border border-line bg-surface sm:grid-cols-[240px_1fr]">
            <Image
              src="/team/athiwat.png"
              alt="ดร.อธิวัฒน์ ธนพัฒน์ธัญโชติ"
              width={480}
              height={640}
              sizes="(min-width: 640px) 240px, 100vw"
              className="aspect-[3/4] h-full w-full object-cover object-top max-sm:max-h-[360px]"
              priority
            />
            <div className="grid content-center gap-3 p-6 md:p-8">
              <span className="pill-ok w-fit">ครูผู้สอน · ที่ปรึกษาหลักสูตร</span>
              <h3 className="text-[clamp(22px,2.6vw,28px)] font-semibold">ดร.อธิวัฒน์ ธนพัฒน์ธัญโชติ</h3>
              <p className="text-[15px] text-soft">
                สอนและดูแลหลักสูตรสมาธิ PAC&apos;C ทั้ง 3 เลเวล ทั้งที่ศูนย์และออนไลน์ ร่วมกำหนดเกณฑ์วัดผล 6-I
                และให้คำแนะนำผู้เรียนและครอบครัวในการประชุมรายเดือน
              </p>
            </div>
          </article>
        </section>

        <section className="pb-14">
          <SectionHead title="ทีมของเรา" text="ทุกฝ่ายทำงานร่วมกันเพื่อให้ผู้เรียนทุกวัยฝึกได้ต่อเนื่อง และเห็นผลจริง" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map(([t, d]) => (
              <article key={t} className="panel">
                <h3 className="text-lg font-semibold">{t}</h3>
                <p className="text-[15px] text-soft">{d}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="pb-14">
          <SectionHead title="คณะที่ปรึกษาประจำหลักสูตร" text="ประชุมทบทวนหลักสูตรทุกไตรมาส และสุ่มตรวจรายงาน 6-I ทุกเดือน" />
          <div className="grid gap-4 md:grid-cols-2">
            {ADVISORS.map(([lvl, who, what]) => (
              <article key={lvl} className="panel">
                <span className="pill-ok w-fit">{lvl}</span>
                <h3 className="text-lg font-semibold">{who}</h3>
                <p className="text-[15px] text-soft">{what}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="scroll-mt-20 pb-6">
          <div className="grid gap-6 rounded-2xl border border-line bg-surface p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
            <div>
              <span className="eyebrow">ติดต่อเรา</span>
              <h2 className="mt-3.5 text-[clamp(22px,2.6vw,28px)] font-semibold">อยากลองเรียนก่อน?</h2>
              <p className="mt-2 text-[15px] text-soft">จองคลาสทดลองได้เลยโดยไม่ต้องสมัครบัญชี หรือสอบถามทาง LINE OA ของศูนย์ (@meditskill)</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/trial" className="btn-primary">จองคลาสทดลอง</Link>
              <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="btn-ghost">แอดไลน์ @meditskill</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
