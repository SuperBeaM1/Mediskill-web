import type { Metadata } from "next";
import { PageHead } from "@/components/ChildSwitcher";
import { bkkParts, nowMs } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase/server";
import { ClassForm } from "./ClassForm";

export const metadata: Metadata = { title: "สร้างคลาส" };

export default async function NewClassPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("courses").select("level, name, sessions").order("level");
  return (
    <>
      <PageHead title="สร้างคลาส" sub="ตั้งค่าครั้งเดียว ระบบสร้างคาบเรียนครบทั้งคอร์สให้อัตโนมัติ (เวลาไทย)" />
      <ClassForm courses={data ?? []} today={bkkParts(new Date(nowMs())).key} />
    </>
  );
}
