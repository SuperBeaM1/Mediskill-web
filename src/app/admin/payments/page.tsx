import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/ChildSwitcher";
import { fmtBaht, fmtDate, fmtLongDate, fmtTime } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase/server";
import { reviewPayment } from "../actions";

export const metadata: Metadata = { title: "ตรวจสลิป" };

const TABS = [
  ["submitted", "รอตรวจ"],
  ["pending", "ยังไม่ชำระ"],
  ["approved", "อนุมัติแล้ว"],
  ["rejected", "ไม่ผ่าน"],
] as const;
type Status = (typeof TABS)[number][0];

type Row = {
  id: string;
  amount: number;
  description: string;
  status: Status;
  slip_path: string | null;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
  parent: { full_name: string; phone: string | null } | null;
};

export default async function PaymentsPage({ searchParams }: PageProps<"/admin/payments">) {
  const sp = await searchParams;
  const status: Status = TABS.some(([k]) => k === sp.status) ? (sp.status as Status) : "submitted";
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("payments")
    .select("id, amount, description, status, slip_path, due_date, paid_at, created_at, parent:profiles(full_name, phone)")
    .eq("status", status)
    .order("created_at", { ascending: status === "submitted" })
    .limit(50);
  const rows = (data ?? []) as unknown as Row[];

  // Short-lived signed links: the slips bucket is private.
  const paths = rows.map((r) => r.slip_path).filter((p): p is string => !!p);
  const signed = paths.length ? (await supabase.storage.from("slips").createSignedUrls(paths, 600)).data ?? [] : [];
  const urlOf = new Map(signed.map((s) => [s.path, s.signedUrl]));

  return (
    <>
      <PageHead title="ตรวจสลิป" sub="อนุมัติแล้วการลงทะเบียนของเด็กจะเปลี่ยนเป็น “กำลังเรียน” ทันที" />

      <div role="tablist" aria-label="สถานะการชำระ" className="flex gap-2 overflow-x-auto">
        {TABS.map(([k, label]) => (
          <Link
            key={k}
            href={`/admin/payments?status=${k}`}
            role="tab"
            aria-selected={k === status}
            className={`min-h-11 shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium no-underline ${k === status ? "border-brand bg-brand text-brand-ink" : "border-line bg-surface text-soft hover:text-ink"}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {rows.length === 0 && <p className="panel hint">ไม่มีรายการในสถานะนี้</p>}

      <div className="grid gap-4 xl:grid-cols-2">
        {rows.map((p) => {
          const url = p.slip_path ? urlOf.get(p.slip_path) : undefined;
          return (
            <article key={p.id} className="panel">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <b className="block font-display text-lg">{p.parent?.full_name ?? "–"}</b>
                  <span className="hint block">
                    {p.parent?.phone ? <a href={`tel:${p.parent.phone}`} className="text-brand">{p.parent.phone}</a> : "ไม่มีเบอร์โทร"}
                  </span>
                </div>
                <span className="font-display text-2xl font-bold tabular-nums">{fmtBaht(p.amount)} ฿</span>
              </div>
              <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-1 text-[15px]">
                <dt className="text-soft">รายการ</dt>
                <dd className="min-w-0">{p.description}</dd>
                <dt className="text-soft">สร้างเมื่อ</dt>
                <dd>{fmtDate(p.created_at)} {fmtTime(p.created_at)}</dd>
                {p.due_date && (
                  <>
                    <dt className="text-soft">ครบกำหนด</dt>
                    <dd>{fmtLongDate(p.due_date)}</dd>
                  </>
                )}
                {p.paid_at && (
                  <>
                    <dt className="text-soft">อนุมัติเมื่อ</dt>
                    <dd>{fmtDate(p.paid_at)} {fmtTime(p.paid_at)}</dd>
                  </>
                )}
              </dl>

              {url ? (
                <a href={url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-line bg-mute">
                  {/* eslint-disable-next-line @next/next/no-img-element -- signed URL from private storage */}
                  <img src={url} alt={`สลิปของ ${p.parent?.full_name ?? "ผู้ปกครอง"}`} className="max-h-[420px] w-full object-contain" />
                  <span className="block border-t border-line px-3 py-2 text-center text-sm text-brand">เปิดสลิปขนาดเต็ม</span>
                </a>
              ) : (
                p.status !== "pending" && <p className="hint">ไม่มีไฟล์สลิป</p>
              )}

              {p.status === "submitted" && (
                <form action={reviewPayment} className="flex flex-wrap gap-3">
                  <input type="hidden" name="payment_id" value={p.id} />
                  <button name="decision" value="approve" className="btn-primary flex-1">อนุมัติ</button>
                  <button name="decision" value="reject" className="btn-ghost flex-1 hover:border-coral hover:text-coral">ไม่ผ่าน ให้ส่งใหม่</button>
                </form>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
