interface StatCardProps {
  title: string;
  value: string;
  hint: string;
}

export function StatCard({ title, value, hint }: StatCardProps) {
  return (
    <article className="glass rounded-2xl p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/85">{title}</p>
      <p className="mt-2 font-[var(--font-sora)] text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-200/80">{hint}</p>
    </article>
  );
}
