import type { Metadata } from "next";
import { PageHead } from "@/components/ChildSwitcher";
import { AGE_GROUP_LABEL, ageOf, fmtLongDate, type AgeGroup } from "@/lib/format";
import { requireAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "นักเรียน" };

type Parent = {
  id: string;
  full_name: string;
  phone: string | null;
  pdpa_consent_at: string | null;
  created_at: string;
  children: {
    id: string;
    nickname: string;
    birth_year: number;
    age_group: AgeGroup;
    enrollments: { status: string; class: { title: string } | null }[];
  }[];
};

const ENR: Record<string, [string, string]> = {
  active: ["pill-ok", "กำลังเรียน"],
  pending: ["pill-wait", "รอชำระ"],
  completed: ["pill-ok", "เรียนจบ"],
  cancelled: ["pill-miss", "ยกเลิก"],
};

export default async function StudentsPage({ searchParams }: PageProps<"/admin/students">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 60) : "";
  const { supabase } = await requireAdmin();

  let query = supabase
    .from("profiles")
    .select("id, full_name, phone, pdpa_consent_at, created_at, children(id, nickname, birth_year, age_group, enrollments(status, class:classes(title)))")
    .eq("role", "parent")
    .order("created_at", { ascending: false })
    .limit(100);
  if (q) {
    const name = q.replace(/[%,()*\\]/g, "");
    const digits = q.replace(/\D/g, "");
    query = query.or([name && `full_name.ilike.%${name}%`, digits && `phone.ilike.%${digits}%`].filter(Boolean).join(",") || "full_name.eq.");
  }
  const parents = ((await query).data ?? []) as unknown as Parent[];

  return (
    <>
      <PageHead title="นักเรียน" sub={`ผู้ปกครอง ${parents.length} บัญชี · เด็ก ${parents.reduce((a, p) => a + p.children.length, 0)} คน`}>
        <form className="flex w-full gap-2 sm:w-auto" role="search">
          <label htmlFor="q" className="sr-only">ค้นหาชื่อหรือเบอร์โทร</label>
          <input id="q" name="q" defaultValue={q} placeholder="ค้นหาชื่อผู้ปกครองหรือเบอร์โทร" className="input sm:w-72" />
          <button className="btn-ghost">ค้นหา</button>
        </form>
      </PageHead>

      {parents.length === 0 && <p className="panel hint">{q ? `ไม่พบ “${q}”` : "ยังไม่มีผู้ปกครองสมัคร"}</p>}

      <div className="grid gap-4 xl:grid-cols-2">
        {parents.map((p) => (
          <article key={p.id} className="panel">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <b className="block font-display text-lg">{p.full_name}</b>
                <span className="hint">
                  {p.phone ? <a href={`tel:${p.phone}`} className="text-brand">{p.phone}</a> : "ไม่มีเบอร์โทร"} · สมัคร {fmtLongDate(p.created_at)}
                </span>
              </div>
              <span className={p.pdpa_consent_at ? "pill-ok" : "pill-miss"}>{p.pdpa_consent_at ? "ยินยอม PDPA" : "ยังไม่ยินยอม PDPA"}</span>
            </div>
            {p.children.length === 0 ? (
              <p className="hint">ยังไม่ได้เพิ่มโปรไฟล์ลูก</p>
            ) : (
              <ul className="grid gap-2">
                {p.children.map((c) => (
                  <li key={c.id} className="rounded-[10px] border border-line px-3.5 py-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <b className="font-medium">น้อง{c.nickname}</b>
                      <span className="hint">{ageOf(c.birth_year)} ปี · {AGE_GROUP_LABEL[c.age_group]}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {c.enrollments.length === 0 && <span className="hint">ยังไม่ลงทะเบียนเรียน</span>}
                      {c.enrollments.map((e, i) => {
                        const [cls, label] = ENR[e.status] ?? ["pill-wait", e.status];
                        return <span key={i} className={cls}>{e.class?.title ?? "–"} · {label}</span>;
                      })}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
