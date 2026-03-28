import type { PropsWithChildren } from "react";

export function Section({ title, subtitle, children }: PropsWithChildren<{ title: string; subtitle?: string }>) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink md:text-3xl">{title}</h2>
        {subtitle ? <p className="mt-1 max-w-3xl text-sm text-slate-600 md:text-base">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}
