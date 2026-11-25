import type { Metadata } from "next";
import Link from "next/link";
import { Sphere } from "@/components/Logo";
import { signOut } from "../(auth)/actions";
import { AdminNav } from "./AdminNav";

export const metadata: Metadata = { title: { default: "แอดมิน", template: "%s · แอดมิน MeditSkill" }, robots: { index: false } };

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-full lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 z-10 border-b border-line bg-surface lg:h-dvh lg:border-r lg:border-b-0">
        <div className="flex flex-col gap-3 px-4 py-3 lg:h-full lg:gap-6 lg:py-6">
          <div className="flex items-center justify-between gap-3">
            <Link href="/admin" className="flex items-center gap-2.5 no-underline" aria-label="แอดมิน MeditSkill">
              <Sphere className="size-8" id="admin-sphere" />
              <span className="leading-none">
                <span className="font-display text-lg font-semibold">
                  <span className="text-brand">Medit</span>
                  <span className="text-[#F5A800]">Skill</span>
                </span>
                <span className="mt-1 block text-[11px] font-semibold tracking-wide text-orange">ADMIN</span>
              </span>
            </Link>
            <form action={signOut} className="lg:hidden">
              <button type="submit" className="btn-ghost min-h-10 px-3 text-sm">ออกจากระบบ</button>
            </form>
          </div>
          <AdminNav />
          <div className="mt-auto hidden gap-2 lg:grid">
            <Link href="/" className="text-sm text-soft hover:text-ink">ดูหน้าเว็บหลัก</Link>
            <form action={signOut}>
              <button type="submit" className="btn-ghost w-full min-h-10 text-sm">ออกจากระบบ</button>
            </form>
          </div>
        </div>
      </aside>
      <main className="grid min-w-0 content-start gap-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
