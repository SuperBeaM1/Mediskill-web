"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const LINKS = [
  ["/app", "ภาพรวม"],
  ["/app/schedule", "ตารางเรียน"],
  ["/app/missions", "ภารกิจ"],
  ["/app/games", "เกม"],
  ["/app/report", "รายงาน 6-I"],
  ["/app/billing", "ชำระเงิน"],
] as const;

function Links() {
  const path = usePathname();
  const child = useSearchParams().get("child");
  return (
    <nav aria-label="เมนูผู้ปกครอง" className="-mx-1 flex max-w-full gap-4 overflow-x-auto px-1 text-sm whitespace-nowrap sm:gap-5 sm:text-base">
      {LINKS.map(([href, label]) => (
        <Link
          key={href}
          href={child && href !== "/app/billing" ? `${href}?child=${child}` : href}
          aria-current={path === href ? "page" : undefined}
          className={`py-1 font-medium no-underline ${path === href ? "text-ink shadow-[inset_0_-2px_0_var(--brand)]" : "text-soft hover:text-ink"}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function AppNav() {
  return (
    <Suspense fallback={<nav className="h-8" />}>
      <Links />
    </Suspense>
  );
}
