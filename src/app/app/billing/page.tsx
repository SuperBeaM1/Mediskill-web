import type { Metadata } from "next";
import { PageHead } from "@/components/ChildSwitcher";
import { fmtBaht, fmtLongDate } from "@/lib/format";
import { requireUser } from "@/lib/supabase/server";
import { PromptPayQR } from "@/components/PromptPayQR";
import { SlipForm } from "./SlipForm";

export const metadata: Metadata = { title: "ชำระเงิน" };

type Payment = {
  id: string;
  amount: number;
  description: string;
  status: "pending" | "submitted" | "approved" | "rejected";
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
};

const STATUS: Record<Payment["status"], [string, string]> = {
  pending: ["pill-wait", "รอชำระ"],
  submitted: ["pill-wait", "รอตรวจสลิป"],
  approved: ["pill-ok", "ชำระแล้ว"],
  rejected: ["pill-miss", "สลิปไม่ผ่าน"],
};

export default async function BillingPage() {
  const { supabase } = await requireUser();
  const [{ data: pays }, { data: enr }] = await Promise.all([
    supabase.from("payments").select("id, amount, description, status, due_date, paid_at, created_at").order("created_at", { ascending: false }),
    supabase.from("enrollments").select("id, status, child:children(nickname), class:classes(title, course:courses(name, sessions))").order("created_at", { ascending: false }),
  ]);
  const payments = (pays ?? []) as Payment[];
  const toPay = payments.filter((p) => p.status === "pending" || p.status === "rejected");
  const waiting = payments.filter((p) => p.status === "submitted");
  const enrollments = (enr ?? []) as unknown as {
    id: string; status: string; child: { nickname: string }; class: { title: string; course: { name: string; sessions: number } };
  }[];
  const promptpay = process.env.PROMPTPAY_ID;

  return (
    <>
      <PageHead title="ชำระเงิน" sub="ค่าเรียนและแอปรายเดือนของทุกคนในบัญชีนี้" />
      <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <section className="panel" aria-labelledby="h-due">
          <h2 id="h-due" className="text-lg font-semibold">ยอดที่ต้องชำระ</h2>
          {toPay.length === 0 && (
            <p className="text-soft">{waiting.length ? "ส่งสลิปแล้ว ทีมงานจะตรวจภายใน 1 วันทำการ" : "ไม่มียอดค้างชำระ"}</p>
          )}
          {toPay.map((p) => (
            <div key={p.id} className="grid gap-4 rounded-xl border border-line p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <b className="font-display">{p.description}</b>
                  <small className="block text-[13px] text-soft">{p.due_date ? `ครบกำหนด ${fmtLongDate(p.due_date)}` : ""}</small>
                </div>
                <span className="font-display text-[28px] font-bold tabular-nums">{fmtBaht(p.amount)} บาท</span>
              </div>
              {p.status === "rejected" && (
                <p className="rounded-[10px] bg-coral-tint px-3 py-2 text-sm text-err">สลิปก่อนหน้าตรวจไม่ผ่าน แนบสลิปใหม่อีกครั้ง</p>
              )}
              <div className="grid items-center gap-4 sm:grid-cols-[220px_1fr]">
                {promptpay && <PromptPayQR amount={p.amount} />}
                <ol className={`grid list-decimal gap-1 pl-5 text-[15px] ${promptpay ? "" : "sm:col-span-2"}`}>
                  <li>
                    {promptpay ? "สแกน QR หรือโอนเข้า PromptPay " : "โอนผ่าน PromptPay ของศูนย์ (ดูเลขที่หน้าเคาน์เตอร์)"}
                    {promptpay && <b className="tabular-nums">{promptpay}</b>} ชื่อบัญชี MeditSkill
                  </li>
                  <li>ตรวจยอด {fmtBaht(p.amount)} บาท ก่อนกดยืนยันในแอปธนาคาร</li>
                  <li>แนบสลิปด้านล่าง ทีมงานตรวจให้ภายใน 1 วันทำการ</li>
                </ol>
              </div>
              <SlipForm paymentId={p.id} />
            </div>
          ))}
        </section>

        <section className="panel" aria-labelledby="h-pk">
          <h2 id="h-pk" className="text-lg font-semibold">แพ็กเกจที่ลงทะเบียน</h2>
          {enrollments.length === 0 && <p className="text-soft">ยังไม่ได้ลงทะเบียนรอบเรียน</p>}
          <div className="grid">
            {enrollments.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3 border-t border-line py-2.5 text-[15px] first:border-t-0">
                <div className="min-w-0">
                  {e.child.nickname} · {e.class.course.name}
                  <small className="block text-[13px] text-soft">{e.class.title}</small>
                </div>
                <span className={e.status === "active" ? "pill-ok" : "pill-wait"}>{e.status === "active" ? "ใช้งาน" : e.status === "pending" ? "รอชำระ" : e.status === "completed" ? "จบแล้ว" : "ยกเลิก"}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="panel" aria-labelledby="h-hist">
        <h2 id="h-hist" className="text-lg font-semibold">ประวัติการชำระเงิน</h2>
        {payments.length === 0 ? (
          <p className="text-soft">ยังไม่มีรายการ</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-[15px] tabular-nums">
              <thead>
                <tr className="border-b border-line text-left text-[13px] text-soft">
                  <th className="px-2.5 py-2 font-medium">วันที่</th>
                  <th className="px-2.5 py-2 font-medium">รายการ</th>
                  <th className="px-2.5 py-2 text-right font-medium">จำนวน (บาท)</th>
                  <th className="px-2.5 py-2 font-medium">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-line">
                    <td className="px-2.5 py-3">{fmtLongDate(p.paid_at ?? p.created_at)}</td>
                    <td className="px-2.5 py-3">{p.description}</td>
                    <td className="px-2.5 py-3 text-right">{fmtBaht(p.amount)}</td>
                    <td className="px-2.5 py-3"><span className={STATUS[p.status][0]}>{STATUS[p.status][1]}</span></td>
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
