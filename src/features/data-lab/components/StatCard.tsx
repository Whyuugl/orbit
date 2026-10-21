
interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
}

export function StatCard({
  label,
  value,
  description,
}: StatCardProps) {
  return (
    <article className="group min-w-0 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-light hover:bg-surface-raised sm:p-5">
      <p className="mb-3 text-[11px] font-medium text-muted">
        {label}
      </p>

      <p className="break-words font-display text-2xl font-semibold tracking-tight text-slate-100">
        {value}
      </p>

      {description && (
        <p className="mt-2 text-[10px] leading-relaxed text-subtle">
          {description}
        </p>
      )}
    </article>
  );
}
