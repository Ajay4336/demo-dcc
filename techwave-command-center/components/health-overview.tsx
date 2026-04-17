import type { DeliveryAssessment } from "@/domain/types";

function badge(risk: number) {
  if (risk >= 70) return { label: "At risk", className: "border-rose-500/50 bg-rose-950/50 text-rose-100" };
  if (risk >= 45) return { label: "Watch", className: "border-amber-500/45 bg-amber-950/40 text-amber-100" };
  return { label: "Healthy", className: "border-emerald-500/40 bg-emerald-950/35 text-emerald-100" };
}

export function HealthOverview({
  assessment,
}: {
  assessment: DeliveryAssessment;
}) {
  const b = badge(assessment.riskScore);
  return (
    <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-zinc-950/90 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Health overview</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
            Composite view of delivery risk and confidence from the rules engine. Drill into factors and sprint
            status below.
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${b.className}`}>{b.label}</span>
      </div>
      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4">
          <dt className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Active factors</dt>
          <dd className="mt-1 font-mono text-2xl text-zinc-100">{assessment.factors.length}</dd>
        </div>
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4">
          <dt className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Top driver</dt>
          <dd className="mt-1 line-clamp-2 text-sm text-zinc-300">
            {assessment.riskDrivers[0] ?? "—"}
          </dd>
        </div>
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4">
          <dt className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Recommendations</dt>
          <dd className="mt-1 font-mono text-2xl text-zinc-100">{assessment.recommendations.length}</dd>
        </div>
      </dl>
    </div>
  );
}
