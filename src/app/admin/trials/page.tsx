import type { Metadata } from "next";
import { PageHead } from "@/components/ChildSwitcher";
import { AGE_GROUP_LABEL, bkkParts, fmtDate, fmtLongDate, fmtTime, nowMs, type AgeGroup } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase/server";
import { deleteTrialSlot, setTrialStatus } from "../actions";
import { SlotForm } from "./SlotForm";

export const metadata: Metadata = { title: "คลาสทดลอง" };

type Booking = { id: string; full_name: string; phone: string; learner_nickname: string; learner_age: number; note: string | null; status: string; created_at: string };
type Slot = { id: string; starts_at: string; minutes: number; format: string; age_group: AgeGroup | null; capacity: number; note: string | null; trial_bookings: Booking[] };

const STATUS: Record<string, [string, string]> = {
  new: ["ใหม่ รอโทร", "pill-wait"],
  confirmed: ["ยืนยันแล้ว", "pill-ok"],
  attended: ["มาเรียนแล้ว", "pill-ok"],
  cancelled: ["ยกเลิก", "pill-miss"],
};

export default async function TrialsPage() {
  const { supabase } = await requireAdmin();
  const now = nowMs();
  const since = new Date(now - 14 * 864e5).toISOString();
  const { data } = await supabase
    .from("trial_slots")
    .select("id, starts_at, minutes, format, age_group, capacity, note, trial_bookings(id, full_name, phone, learner_nickname, learner_age, note, status, created_at)")
    .gte("starts_at", since)
    .order("starts_at");
  const slots = (data ?? []) as unknown as Slot[];
  const upcoming = slots.filter((s) => Date.parse(s.starts_at) > now);
  const past = slots.filter((s) => Date.parse(s.starts_at) <= now).reverse();
  const newCount = slots.flatMap((s) => s.trial_bookings).filter((b) => b.status === "new").length;

  return (
    <>
      <PageHead title="คลาสทดลอง" sub={`รอโทรยืนยัน ${newCount} คน · หน้าจองสำหรับลูกค้าอยู่ที่ /trial`} />

      <section className="panel" aria-labelledby="h-new-slot">
        <h2 id="h-new-slot" className="text-lg font-semibold">เปิดรอบใหม่</h2>
        <SlotForm today={bkkParts(new Date(now)).key} />
      </section>

      <SlotGroup title="รอบที่จะถึง" slots={upcoming} empty="ยังไม่มีรอบที่เปิด" canDelete />
      {past.length > 0 && <SlotGroup title="ผ่านไปแล้ว (14 วันล่าสุด)" slots={past} empty="" />}
    </>
  );
}

function SlotGroup({ title, slots, empty, canDelete = false }: { title: string; slots: Slot[]; empty: string; canDelete?: boolean }) {
  return (
    <section className="grid gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {slots.length === 0 && <p className="panel hint">{empty}</p>}
      {slots.map((s) => {
        const active = s.trial_bookings.filter((b) => b.status !== "cancelled");
        return (
          <article key={s.id} className="panel">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <b className="block font-display text-lg">
                  {fmtLongDate(s.starts_at)} · {fmtTime(s.starts_at)}–{fmtTime(new Date(Date.parse(s.starts_at) + s.minutes * 6e4))}
                </b>
                <span className="hint">
                  {s.format === "online" ? "ออนไลน์" : "ที่ศูนย์"} · {s.age_group ? AGE_GROUP_LABEL[s.age_group] : "ทุกวัย"}
                  {s.note ? ` · ${s.note}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={active.length >= s.capacity ? "pill-miss" : "pill-ok"}>จอง {active.length}/{s.capacity}</span>
                {canDelete && active.length === 0 && (
                  <form action={deleteTrialSlot}>
                    <input type="hidden" name="slot_id" value={s.id} />
                    <button className="btn-ghost min-h-10 px-3 text-sm hover:border-coral hover:text-coral">ปิดรอบ</button>
                  </form>
                )}
              </div>
            </div>
            {s.trial_bookings.length === 0 ? (
              <p className="hint">ยังไม่มีคนจอง</p>
            ) : (
              <ul className="grid">
                {s.trial_bookings.map((b) => {
                  const [label, pill] = STATUS[b.status] ?? [b.status, "pill-wait"];
                  return (
                    <li key={b.id} className="grid gap-2 border-t border-line py-3 first:border-t-0 md:grid-cols-[1fr_auto] md:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <b className="font-medium">{b.learner_nickname} ({b.learner_age} ปี)</b>
                          <span className={pill}>{label}</span>
                        </div>
                        <span className="hint block">
                          ติดต่อ {b.full_name} · <a href={`tel:${b.phone}`} className="text-brand">{b.phone}</a> · จองเมื่อ {fmtDate(b.created_at)}
                        </span>
                        {b.note && <p className="mt-1 text-[15px]">“{b.note}”</p>}
                      </div>
                      <form action={setTrialStatus} className="flex gap-2">
                        <input type="hidden" name="booking_id" value={b.id} />
                        <label htmlFor={`st-${b.id}`} className="sr-only">สถานะของ {b.learner_nickname}</label>
                        <select id={`st-${b.id}`} name="status" defaultValue={b.status} className="input min-h-11 w-40">
                          {Object.entries(STATUS).map(([k, [l]]) => (
                            <option key={k} value={k}>{l}</option>
                          ))}
                        </select>
                        <button className="btn-ghost min-h-11">บันทึก</button>
                      </form>
                    </li>
                  );
                })}
              </ul>
            )}
          </article>
        );
      })}
    </section>
  );
}
