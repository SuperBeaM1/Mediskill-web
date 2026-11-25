import type { Metadata } from "next";
import Link from "next/link";
import { GameHub } from "@/components/games/GameHub";
import { PageHero, SectionHead } from "@/components/SectionHead";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "เกมฝึกสมาธิ",
  description: "ลองเล่นเกมฝึกสมาธิของ MeditSkill ฟรี: Breathing Bubble, Memory Sequence, Go/No-Go และ Color-Word Stroop",
};

const SOON = [
  ["Tidy Room", "MQ · EF การวางแผน", "5+"],
  ["Focus Fish", "EF จดจ่อต่อเนื่อง", "8+"],
  ["Pattern Next", "IQ ตรรกะ", "8+"],
  ["Code a Robot", "Creative Focus", "11+"],
] as const;

const RULES = [
  "รอบละ 2–3 นาที และตั้งเวลาเล่นสูงสุดต่อวันได้",
  "ไม่มีโฆษณา ไม่มีการซื้อในเกม",
  "ไม่มีกระดานคะแนนแข่งกับคนแปลกหน้า แข่งกับตัวเองเมื่อวาน",
  "ความยากปรับเองอัตโนมัติ ถูก 3 ครั้งติดยากขึ้น ผิด 2 ครั้งติดง่ายลง",
];

export default function GamesPage() {
  return (
    <>
      <SiteHeader />
      <main className="wrap">
        <PageHero
          eyebrow="ลองเล่นฟรี"
          title="เกมฝึกสมาธิ เล่นวันละ 15–20 นาที"
          text="แต่ละเกมฝึกทักษะคนละด้านในรายงาน 6-I ลองเล่นได้เลยตรงนี้ หน้านี้ไม่บันทึกคะแนน"
        >
          <p className="mt-4 text-[15px]">
            อยากเก็บคะแนนเข้ารายงานของคุณ?{" "}
            <Link href="/app/games" className="font-medium text-brand">เข้าสู่ระบบแล้วเล่นในแอป</Link>
          </p>
        </PageHero>
        <GameHub />

        <section className="py-14">
          <SectionHead title="เกมที่กำลังจะมา" text="เปิดให้นักเรียนในระบบก่อน" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SOON.map(([name, skill, age]) => (
              <article key={name} className="panel">
                <span className="pill-wait w-fit">เร็ว ๆ นี้</span>
                <h3 className="text-lg font-semibold">{name}</h3>
                <p className="hint">{skill} · {age} ปี</p>
              </article>
            ))}
          </div>
        </section>

        <section className="pb-6">
          <div className="grid gap-6 rounded-2xl border border-line bg-surface p-6 md:grid-cols-[.8fr_1.2fr] md:p-8">
            <div>
              <span className="eyebrow">ออกแบบให้ทุกวัย</span>
              <h2 className="mt-3.5 text-[clamp(22px,2.6vw,28px)] font-semibold">ออกแบบให้เล่นพอดี ไม่ติดจอ</h2>
              <Link href="/register" className="btn-primary mt-5">สมัครแล้วเล่นในระบบ</Link>
            </div>
            <ul className="grid gap-3">
              {RULES.map((r) => (
                <li key={r} className="flex gap-3 text-[15px]">
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-orange" aria-hidden="true" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
