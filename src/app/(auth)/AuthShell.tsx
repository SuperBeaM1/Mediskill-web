import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export function AuthShell({
  active,
  title,
  text,
  steps,
  note,
  children,
}: {
  active: "login" | "register";
  title: string;
  text: string;
  steps: string[];
  note: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="wrap grid items-start gap-10 py-10 md:grid-cols-2 md:py-12">
        <aside className="order-2 flex flex-col rounded-2xl md:order-1 bg-brand-tint p-6 md:min-h-[520px] md:p-9">
          <h2 className="text-[clamp(26px,3vw,34px)] font-semibold">{title}</h2>
          <p className="mt-3 text-soft">{text}</p>
          <ol className="mt-7 grid gap-3">
            {steps.map((s, i) => (
              <li key={s} className="flex items-start gap-3.5 rounded-xl border border-line bg-surface px-4 py-3.5">
                <b className="grid size-[30px] flex-none place-items-center rounded-lg bg-brand font-display text-brand-ink">{i + 1}</b>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <p className="mt-auto border-t border-brand/25 pt-7 text-[15px] text-soft">{note}</p>
        </aside>
        <div className="order-1 min-w-0 rounded-2xl md:order-2 border border-line bg-surface p-6 shadow-lg shadow-ink/5 md:p-9">
          <nav aria-label="สลับหน้า" className="mb-6 flex rounded-[10px] bg-mute p-1">
            {(["login", "register"] as const).map((k) => (
              <Link
                key={k}
                href={`/${k}`}
                aria-current={active === k ? "page" : undefined}
                className={`flex min-h-11 flex-1 items-center justify-center rounded-lg font-display font-medium no-underline ${active === k ? "bg-surface text-ink shadow" : "text-soft"}`}
              >
                {k === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
              </Link>
            ))}
          </nav>
          {children}
        </div>
      </main>
    </>
  );
}

export function FieldError({ msg, id }: { msg?: string; id: string }) {
  return msg ? (
    <span id={id} className="text-[13px] text-err">
      {msg}
    </span>
  ) : null;
}
