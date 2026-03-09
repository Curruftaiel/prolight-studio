import type {ReactNode} from 'react';

type MetricCardProps = {
  label: string;
  value: string;
  tone?: 'default' | 'good' | 'warn' | 'critical';
  children?: ReactNode;
};

const toneClass: Record<NonNullable<MetricCardProps['tone']>, string> = {
  default: 'border-slate-700',
  good: 'border-emerald-500',
  warn: 'border-amber-500',
  critical: 'border-rose-500',
};

export function MetricCard({label, value, tone = 'default', children}: MetricCardProps) {
  return (
    <article className={`rounded-xl border bg-slate-900/50 p-4 ${toneClass[tone]}`}>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {children ? <div className="mt-2 text-sm text-slate-300">{children}</div> : null}
    </article>
  );
}
