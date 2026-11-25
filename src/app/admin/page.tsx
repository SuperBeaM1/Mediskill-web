import Link from "next/link";
import { PageHead } from "@/components/ChildSwitcher";
import { bkkParts, fmtBaht, fmtDate, fmtTime, nowMs } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase/server";
import { Icon } from "./AdminNav";

export default async function AdminHome() {
  const { supabase, name } = await requireAdmin();
  const nowT = nowMs();
  const t = bkkParts(new Date(nowT));
  const monthStart = `${t.key.slice(0, 7)}-01T00:00:00+07:00`;
  const now = new Date(nowT).toISOString();
  const weekEnd = new Date(nowT + 7 * 864e5).toISOString();
  const head = { count: "exact" as const, head: true };

  const [parents, kids, active, pendingEnr, slips, paid, upcoming] = await Promise.all([
    supabase.from("profiles").select("id", head).eq("role", "parent"),
    supabase.from("children").select("id", head),
    supabase.from("enrollments").select("id", head).eq("status", "active"),
    supabase.from("enrollments").select("id", head).eq("status", "pending"),
    supabase
      .from("payments")
      .select("id, amount, description, created_at, parent:profiles(full_name)")
      .eq("status", "submitted")
      .order("created_at")
      .limit(5),
    supabase.from("payments").select("amount").eq("status", "approved").gte("paid_at", monthStart),
    supabase
      .from("class_sessions")
      .select("id, session_no, topic, starts_at, class:classes(title, room)")
      .gte("starts_at", now)
      .lt("starts_at", weekEnd)
      .order("starts_at")
      .limit(8),
  ]);

  const revenue = (paid.data ?? []).reduce((a, r) => a + (r.amount as number), 0);
  const slipRows = (slips.data ?? []) as unknown as { id: string; amount: number; description: string; created_at: string; parent: { full_name: string } | null }[];
  const sessions = (upcoming.data ?? []) as unknown as { id: string; session_no: number; topic: string; starts_at: string; class: { title: string; room: string | null } }[];

  const kpis = [
    ["ผู้ปกครอง", parents.count ?? 0, "บัญชี"],
    ["นักเรียน", kids.count ?? 0, "คน"],
    ["กำลังเรียน", active.count ?? 0, `รอชำระ ${pendingEnr.count ?? 0}`],
    ["รายรับเดือนนี้", fmtBaht(revenue), "บาท (อนุมัติแล้ว)"],
  ] as const;

  return (
    <>
      <PageHead title={`สวัสดี ${name}`} sub="ภาพรวมของศูนย์วันนี้" />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map(([k, v, s]) => (
          <div key={k} className="rounded-xl border border-line bg-surface p-4 sm:p-5">
            <span className="text-sm text-soft">{k}</span>
            <b className="mt-1 block font-display text-[clamp(24px,3vw,32px)] font-semibold tabular-nums">{v}</b>
            <span className="hint">{s}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="panel" aria-labelledby="h-slips">
          <div className="flex items-center justify-between gap-3">
            <h2 id="h-slips" className="text-lg font-semibold">สลิปรอตรวจ</h2>
            <Link href="/admin/payments" className="text-sm font-medium text-brand">ดูทั้งหมด</Link>
          </div>
          {slipRows.length === 0 ? (
            <p className="hint">ไม่มีสลิปรอตรวจ</p>
          ) : (
            <ul className="grid">
              {slipRows.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 border-t border-line py-3 first:border-t-0">
                  <div className="min-w-0">
                    <b className="block truncate font-medium">{p.parent?.full_name ?? "–"}</b>
                    <span className="hint block truncate">{p.description} · ส่งเมื่อ {fmtDate(p.created_at)}</span>
                  </div>
                  <span className="font-display font-semibold tabular-nums">{fmtBaht(p.amount)}</span>
                </li>
              ))}
            </ul>
          )}
          {slipRows.length > 0 && (
            <Link href="/admin/payments" className="btn-primary justify-self-start">
              <Icon name="pay" /> ตรวจสลิป
            </Link>
          )}
        </section>

        <section className="panel" aria-labelledby="h-week">
          <div className="flex items-center justify-between gap-3">
            <h2 id="h-week" className="text-lg font-semibold">คาบเรียน 7 วันข้างหน้า</h2>
            <Link href="/admin/classes" className="text-sm font-medium text-brand">ดูคลาสทั้งหมด</Link>
          </div>
          {sessions.length === 0 ? (
            <p className="hint">ไม่มีคาบเรียนใน 7 วันนี้</p>
          ) : (
            <ul className="grid">
              {sessions.map((s) => (
                <li key={s.id} className="grid grid-cols-[88px_1fr] gap-3 border-t border-line py-3 first:border-t-0">
                  <span className="text-sm tabular-nums">
                    <b className="block font-medium">{fmtDate(s.starts_at)}</b>
                    <span className="text-soft">{fmtTime(s.starts_at)}</span>
                  </span>
                  <div className="min-w-0">
                    <b className="block truncate font-medium">{s.class.title}</b>
                    <span className="hint block truncate">คาบ {s.session_no} · {s.topic}{s.class.room ? ` · ${s.class.room}` : ""}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
