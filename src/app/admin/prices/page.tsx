import type { Metadata } from "next";
import { PageHead } from "@/components/ChildSwitcher";
import { requireAdmin } from "@/lib/supabase/server";
import { PriceForm } from "./PriceForm";

export const metadata: Metadata = { title: "ราคา" };

const UNIT: Record<string, string> = { one_time: "จ่ายครั้งเดียว", month: "ต่อเดือน", classroom: "ต่อห้อง" };

export default async function PricesPage() {
  const { supabase } = await requireAdmin();
  const [{ data: courses }, { data: packages }] = await Promise.all([
    supabase.from("courses").select("level, name, hours, price").order("level"),
    supabase.from("packages").select("code, name, unit, price, description").order("price"),
  ]);

  return (
    <>
      <PageHead title="ราคา" sub="ราคาใหม่ใช้กับบิลที่สร้างหลังจากนี้ บิลเดิมไม่เปลี่ยน" />
      <section className="panel" aria-labelledby="h-courses">
        <h2 id="h-courses" className="text-lg font-semibold">คอร์สรายเลเวล</h2>
        <div>
          {(courses ?? []).map((c) => (
            <PriceForm key={c.level} kind="course" itemKey={String(c.level)} name={c.name} sub={`${c.hours} ชั่วโมง`} price={c.price} />
          ))}
        </div>
      </section>
      <section className="panel" aria-labelledby="h-packages">
        <h2 id="h-packages" className="text-lg font-semibold">แพ็กเกจ</h2>
        <div>
          {(packages ?? []).map((p) => (
            <PriceForm key={p.code} kind="package" itemKey={p.code} name={p.name} sub={[UNIT[p.unit], p.description].filter(Boolean).join(" · ")} price={p.price} />
          ))}
        </div>
      </section>
      <p className="hint">หน้าเว็บหลักยังแสดงราคาที่เขียนไว้ในโค้ด ถ้าเปลี่ยนราคาที่นี่ ต้องแก้หน้าแรกให้ตรงกันด้วย</p>
    </>
  );
}
