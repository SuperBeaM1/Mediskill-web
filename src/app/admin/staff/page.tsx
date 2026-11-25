import type { Metadata } from "next";
import { PageHead } from "@/components/ChildSwitcher";
import { fmtLongDate } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase/server";
import { setRole } from "../actions";

export const metadata: Metadata = { title: "ทีมงาน" };

const ROLE: Record<string, [string, string]> = {
  parent: ["ผู้ใช้ทั่วไป", "pill-wait"],
  teacher: ["ครู", "pill-ok"],
  admin: ["แอดมิน", "pill-ok"],
};

type Row = { id: string; full_name: string; phone: string | null; role: string; created_at: string; classes: { title: string }[] };

export default async function StaffPage({ searchParams }: PageProps<"/admin/staff">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 60) : "";
  const { supabase, user } = await requireAdmin();

  let query = supabase
    .from("profiles")
    .select("id, full_name, phone, role, created_at, classes!classes_teacher_id_fkey(title)")
    .order("role", { ascending: false })
    .order("created_at")
    .limit(100);
  if (q) query = query.ilike("full_name", `%${q.replace(/[%,()*\\]/g, "")}%`);
  const rows = ((await query).data ?? []) as unknown as Row[];
  const staff = rows.filter((r) => r.role !== "parent");
  const others = rows.filter((r) => r.role === "parent");

  return (
    <>
      <PageHead title="ทีมงาน" sub="ให้คนที่สมัครแล้วเป็นครูหรือแอดมิน ครูเข้าหน้าของตัวเองที่ /teacher">
        <form className="flex w-full gap-2 sm:w-auto" role="search">
          <label htmlFor="q" className="sr-only">ค้นหาชื่อ</label>
          <input id="q" name="q" defaultValue={q} placeholder="ค้นหาชื่อ" className="input sm:w-64" />
          <button className="btn-ghost">ค้นหา</button>
        </form>
      </PageHead>

      <Group title={`ครูและแอดมิน (${staff.length})`} rows={staff} me={user.id} empty="ยังไม่มีครู เลือกจากรายชื่อด้านล่างแล้วเปลี่ยนบทบาทเป็นครู" />
      <Group title={`ผู้ใช้ทั่วไป (${others.length})`} rows={others} me={user.id} empty={q ? `ไม่พบ “${q}”` : "ยังไม่มีผู้ใช้"} />
    </>
  );
}

function Group({ title, rows, me, empty }: { title: string; rows: Row[]; me: string; empty: string }) {
  return (
    <section className="panel">
      <h2 className="text-lg font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="hint">{empty}</p>
      ) : (
        <ul className="grid">
          {rows.map((r) => {
            const [label, pill] = ROLE[r.role] ?? [r.role, "pill-wait"];
            return (
              <li key={r.id} className="grid gap-3 border-t border-line py-3.5 first:border-t-0 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <b className="font-medium">{r.full_name}</b>
                    <span className={pill}>{label}</span>
                    {r.id === me && <span className="hint">(คุณ)</span>}
                  </div>
                  <span className="hint block">
                    {r.phone ?? "ไม่มีเบอร์โทร"} · สมัคร {fmtLongDate(r.created_at)}
                    {r.classes.length > 0 && ` · สอน ${r.classes.map((c) => c.title).join(", ")}`}
                  </span>
                </div>
                {r.id === me ? (
                  <span className="hint">เปลี่ยนบทบาทตัวเองไม่ได้</span>
                ) : (
                  <form action={setRole} className="flex gap-2">
                    <input type="hidden" name="user_id" value={r.id} />
                    <label htmlFor={`role-${r.id}`} className="sr-only">บทบาทของ {r.full_name}</label>
                    <select id={`role-${r.id}`} name="role" defaultValue={r.role} className="input min-h-11 w-36">
                      <option value="parent">ผู้ใช้ทั่วไป</option>
                      <option value="teacher">ครู</option>
                      <option value="admin">แอดมิน</option>
                    </select>
                    <button className="btn-ghost min-h-11">บันทึก</button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
