import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/SectionHead";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { AGE_GROUP_LABEL, fmtLongDate, fmtTime, type AgeGroup } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { TrialForm, type OpenSlot } from "./TrialForm";

export const metadata: Metadata = {
  title: "จองคลาสทดลอง",
  description: "จองคลาสทดลองหลักสูตร PAC'C ที่ศูนย์หรือออนไลน์ ได้ทุกวัย ไม่ต้องสมัครบัญชีก่อน",
};

async function Slots() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("trial_slots_open");
  const slots: OpenSlot[] = ((data ?? []) as { id: string; starts_at: string; minutes: number; format: "onsite" | "online"; age_group: AgeGroup | null; note: string | null; seats_left: number }[]).map((s) => ({
    id: s.id,
    dateLabel: fmtLongDate(s.starts_at),
    timeLabel: `${fmtTime(s.starts_at)}–${fmtTime(new Date(Date.parse(s.starts_at) + s.minutes * 6e4))}`,
    format: s.format,
    group: s.age_group ? AGE_GROUP_LABEL[s.age_group] : null,
    note: s.note,
    seats: s.seats_left,
  }));
  return <TrialForm slots={slots} />;
}

export default function TrialPage() {
  return (
    <>
      <SiteHeader />
      <main className="wrap pb-6">
        <PageHero
          eyebrow="คลาสทดลอง"
          title="ลองฝึกสมาธิกับเรา 1 คาบ ก่อนตัดสินใจ"
          text="เลือกรอบที่สะดวก ที่ศูนย์หรือออนไลน์ผ่าน Google Meet ไม่ต้องสมัครบัญชีก่อน ทีมงานจะโทรยืนยันภายใน 1 วันทำการ"
        />
        <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-line/60" aria-label="กำลังโหลดรอบ" />}>
          <Slots />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
