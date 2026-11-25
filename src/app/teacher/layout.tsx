import type { Metadata } from "next";
import Link from "next/link";
import { Sphere } from "@/components/Logo";
import { signOut } from "../(auth)/actions";

export const metadata: Metadata = { title: { default: "ครู", template: "%s · ครู MeditSkill" }, robots: { index: false } };

export default function TeacherLayout({ children }: LayoutProps<"/teacher">) {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1120px] items-center gap-4 px-4 py-3">
          <Link href="/teacher" className="flex items-center gap-2.5 no-underline" aria-label="หน้าครู MeditSkill">
            <Sphere className="size-8" id="teacher-sphere" />
            <span className="leading-none">
              <span className="font-display text-lg font-semibold">
                <span className="text-brand">Medit</span>
                <span className="text-[#F5A800]">Skill</span>
              </span>
              <span className="mt-1 block text-[11px] font-semibold tracking-wide text-orange">TEACHER</span>
            </span>
          </Link>
          <nav aria-label="เมนูครู" className="ml-auto flex items-center gap-2">
            <Link href="/teacher" className="hidden min-h-11 items-center rounded-[10px] px-3 font-medium text-soft no-underline hover:text-ink sm:flex">ตารางสอน</Link>
            <form action={signOut}>
              <button type="submit" className="btn-ghost min-h-10 px-3 text-sm">ออกจากระบบ</button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto grid w-full max-w-[1120px] content-start gap-5 px-4 py-6 sm:py-8">{children}</main>
    </>
  );
}
