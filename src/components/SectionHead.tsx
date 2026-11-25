export function SectionHead({ title, text }: { title: string; text: string }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
      <h2 className="text-[clamp(26px,3.2vw,36px)] font-semibold">{title}</h2>
      <p className="max-w-[30em] text-soft">{text}</p>
    </div>
  );
}

export function PageHero({ eyebrow, title, text, children }: { eyebrow: string; title: string; text: string; children?: React.ReactNode }) {
  return (
    <section className="py-12 md:py-16">
      <span className="eyebrow">{eyebrow}</span>
      <h1 className="mt-4 max-w-[18em] text-[clamp(30px,4vw,44px)] font-bold tracking-tight">{title}</h1>
      <p className="mt-4 max-w-[40em] text-lg text-soft">{text}</p>
      {children}
    </section>
  );
}
