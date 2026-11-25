import Link from "next/link";

/** Orange sphere from the MeditSkill logo. */
export function Sphere({ className = "size-8", id = "sphere" }: { className?: string; id?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={id} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE9D2" />
          <stop offset="45%" stopColor="#FDA85A" />
          <stop offset="100%" stopColor="#F27A12" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="49" fill={`url(#${id})`} />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} aria-label="MeditSkill หน้าแรก" className="flex items-center gap-2.5 no-underline">
      <Sphere className="size-9" id="logo-sphere" />
      <span className="grid leading-none">
        <span className="font-display text-[22px] font-semibold tracking-tight">
          <span className="text-brand">Medit</span>
          <span className="text-[#F5A800]">Skill</span>
        </span>
        <span className="mt-1 hidden text-[11px] font-medium text-soft sm:block">ศูนย์พัฒนาทักษะสมาธิเมดิทสกิล</span>
      </span>
    </Link>
  );
}
