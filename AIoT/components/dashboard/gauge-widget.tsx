interface GaugeWidgetProps {
  title: string;
  value: number;
  unit: string;
  maxValue: number;
}

export function GaugeWidget({ title, value, unit, maxValue }: GaugeWidgetProps) {
  const progress = Math.min(100, Math.round((value / maxValue) * 100));

  return (
    <article className="glass rounded-2xl p-4">
      <p className="text-sm text-slate-200">{title}</p>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-900/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal to-cyan transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-3 font-[var(--font-sora)] text-2xl font-semibold">
        {value.toFixed(1)} {unit}
      </p>
      <p className="text-xs text-slate-300/80">{progress}% of configured range</p>
    </article>
  );
}
