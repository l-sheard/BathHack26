import type { PropsWithChildren } from "react";

export function Section({ title, subtitle, children }: PropsWithChildren<{ title: string; subtitle?: string }>) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
        {subtitle ? <p className="text-sm text-slate-600">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}
