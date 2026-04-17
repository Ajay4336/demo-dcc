import type { JiraSignals } from "@/domain/types";

export function SprintStatus({ j }: { j: JiraSignals }) {
  const burn =
    j.committedPoints > 0 ? Math.round((j.completedPoints / j.committedPoints) * 100) : 0;
  const scopeRatio =
    j.committedPoints > 0 ? Math.round((j.addedScopePoints / j.committedPoints) * 100) : 0;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h3 className="text-sm font-semibold text-zinc-100">Sprint status</h3>
      <p className="mt-1 text-xs text-zinc-500">
        {j.sprintName} · {j.projectKey}
      </p>
      <div className="mt-4 space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-xs text-zinc-500">
            <span>Completion vs commitment</span>
            <span className="font-mono text-zinc-300">{burn}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-emerald-500/80"
              style={{ width: `${Math.min(100, burn)}%` }}
            />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs text-zinc-500">
            <span>Scope added vs original</span>
            <span className="font-mono text-amber-200/90">{scopeRatio}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-amber-500/70"
              style={{ width: `${Math.min(100, scopeRatio)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
