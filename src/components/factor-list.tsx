import type { RiskFactor } from "@/domain/types";

const severityStyle: Record<RiskFactor["severity"], string> = {
  critical: "border-rose-500/50 bg-rose-950/40 text-rose-100",
  high: "border-amber-500/40 bg-amber-950/30 text-amber-100",
  medium: "border-sky-500/35 bg-sky-950/25 text-sky-100",
  low: "border-zinc-600/50 bg-zinc-900/50 text-zinc-300",
};

export function FactorList({ factors }: { factors: RiskFactor[] }) {
  if (factors.length === 0) {
    return <p className="text-sm text-zinc-500">No factors flagged for this snapshot.</p>;
  }
  return (
    <ul className="space-y-3">
      {factors.map((f) => (
        <li
          key={f.id}
          className={`rounded-xl border px-4 py-3 ${severityStyle[f.severity]}`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{f.label}</span>
            <span className="rounded-md bg-black/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
              {f.source}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed opacity-90">{f.detail}</p>
        </li>
      ))}
    </ul>
  );
}
