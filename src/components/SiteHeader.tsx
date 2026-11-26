import Link from "next/link";
import { Logo } from "./Logo";

/** Public add-friend link for the center's LINE Official Account. */
export const LINE_URL = "https://line.me/R/ti/p/@meditskill";

const NAV = [
  ["/courses", "หลักสูตร"],
  ["/games", "เกมฝึกสมาธิ"],
  ["/report-6i", "รายงาน 6-I"],
  ["/about", "เกี่ยวกับเรา"],
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur">
      <div className="wrap flex items-center gap-4 py-3.5">
        <Logo />
        <nav aria-label="เมนูหลัก" className="ml-auto flex items-center gap-5">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className="hidden font-medium text-soft hover:text-ink lg:inline">{label}</Link>
          ))}
          <Link href="/login" className="btn-ghost hidden sm:inline-flex">เข้าสู่ระบบ</Link>
          <Link href="/trial" className="btn-primary hidden sm:inline-flex">จองคลาสทดลอง</Link>
          <details className="relative lg:hidden">
            <summary className="btn-ghost list-none px-3 [&::-webkit-details-marker]:hidden" aria-label="เปิดเมนู">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            </summary>
            <div className="absolute right-0 mt-2 grid w-56 gap-1 rounded-xl border border-line bg-surface p-2 shadow-lg">
              {NAV.map(([href, label]) => (
                <Link key={href} href={href} className="rounded-lg px-3 py-2.5 font-medium no-underline hover:bg-brand-tint">{label}</Link>
              ))}
              <hr className="my-1 border-line sm:hidden" />
              <Link href="/login" className="rounded-lg px-3 py-2.5 font-medium no-underline hover:bg-brand-tint sm:hidden">เข้าสู่ระบบ</Link>
              <Link href="/trial" className="btn-primary sm:hidden">จองคลาสทดลอง</Link>
            </div>
          </details>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-line py-7 text-sm text-soft">
      <div className="wrap grid gap-4">
        <nav aria-label="เมนูท้ายเว็บ" className="flex flex-wrap gap-x-5 gap-y-2">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className="hover:text-ink">{label}</Link>
          ))}
        </nav>
        <div className="flex flex-wrap justify-between gap-4">
          <span>
            MeditSkill · สมาธิ คือ นวัตกรรมของชีวิต ·{" "}
            <a href={LINE_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-brand">LINE @meditskill</a>
          </span>
          <Link href="/privacy" className="hover:text-ink">นโยบายความเป็นส่วนตัว (PDPA)</Link>
        </div>
      </div>
    </footer>
  );
}
