import type { PropsWithChildren } from "react";

export function Section({
  title,
  subtitle,
  children,
}: PropsWithChildren<{ title: string; subtitle?: string }>) {
  return (
    <section className="space-y-4">
      <div>
        <h2
          className="font-display text-2xl font-extrabold tracking-tight md:text-3xl"
          style={{ color: "#000000" }}
        >
          {title}
        </h2>
        {subtitle ? (
          <p
            className="mt-1 max-w-3xl text-sm md:text-base"
            style={{ color: "#000000", fontWeight: 500 }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
