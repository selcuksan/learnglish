import type { ReactNode } from "react";

export function StatCard({
  eyebrow,
  title,
  detail,
  accent,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  accent?: ReactNode;
}) {
  return (
    <section className="glass-panel rounded-[1.75rem] border border-white/70 p-5 shadow-[0_18px_60px_rgba(29,44,76,0.09)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {eyebrow}
          </p>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
            {title}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
        </div>
        {accent}
      </div>
    </section>
  );
}
