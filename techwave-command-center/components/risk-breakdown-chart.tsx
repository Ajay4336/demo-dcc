import type { RiskSignalBreakdown } from "@/domain/types";

const ROWS: { key: keyof RiskSignalBreakdown; label: string; weight: string }[] = [
  { key: "backlogAgingRisk", label: "Backlog aging", weight: "×0.15" },
  { key: "blockerRisk", label: "Blocker", weight: "×0.20" },
  { key: "reopenRisk", label: "Reopen", weight: "×0.15" },
  { key: "overdueRisk", label: "Overdue", weight: "×0.10" },
  { key: "prReviewDelayRisk", label: "PR review delay", weight: "×0.10" },
  { key: "stalePrRisk", label: "Stale PRs", weight: "×0.10" },
  { key: "workloadImbalanceRisk", label: "Workload imbalance", weight: "×0.10" },
  { key: "scopeChurnRisk", label: "Scope churn", weight: "×0.10" },
];

export function RiskBreakdownChart({ breakdown }: { breakdown: RiskSignalBreakdown }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h3 className="text-sm font-semibold text-zinc-100">Risk components (0–100)</h3>
      <p className="mt-1 text-xs text-zinc-500">
        Weighted sum → delivery risk. Overdue/reopen use live fields when present; otherwise proxies apply.
      </p>
      <div className="mt-4 space-y-3">
        {ROWS.map((row) => {
          const v = breakdown[row.key];
          return (
            <div key={row.key}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-zinc-500">
                  {row.label}{" "}
                  <span className="text-zinc-600">{row.weight}</span>
                </span>
                <span className="font-mono text-zinc-200">{v}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-sky-500/70"
                  style={{ width: `${v}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
