"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ICONS = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  pay: "M4 4h16v16l-3-2-3 2-2-2-2 2-3-2-3 2zM8 9h8M8 13h5",
  users: "M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6M22 19v-1a4 4 0 0 0-3-3.9M16 4.1a3 3 0 0 1 0 5.8",
  cal: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  tag: "M3 12V4h8l10 10-8 8zM7.5 7.5h.01",
  trial: "M9 11l2 2 4-4M5 4h14v17H5zM9 2v4M15 2v4",
  staff: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1M17 3l1.5 1.5L21 2",
} as const;

export const ADMIN_LINKS = [
  ["/admin", "ภาพรวม", "home"],
  ["/admin/payments", "ตรวจสลิป", "pay"],
  ["/admin/trials", "คลาสทดลอง", "trial"],
  ["/admin/students", "ผู้เรียน", "users"],
  ["/admin/staff", "ทีมงาน", "staff"],
  ["/admin/classes", "คลาสเรียน", "cal"],
  ["/admin/prices", "ราคา", "tag"],
] as const;

export function Icon({ name, className = "size-5" }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="เมนูแอดมิน" className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {ADMIN_LINKS.map(([href, label, icon]) => {
        const on = href === "/admin" ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={on ? "page" : undefined}
            className={`flex min-h-11 shrink-0 items-center gap-3 rounded-[10px] px-3 font-medium whitespace-nowrap no-underline transition ${on ? "bg-brand text-brand-ink" : "text-soft hover:bg-brand-tint hover:text-ink"}`}
          >
            <Icon name={icon} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
