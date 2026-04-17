import type { HistoricSprint, ProjectScenario } from "@/domain/types";
import { computeOnTrackBaseline, formatPct, metricsFromCurrent } from "@/lib/sprint/baseline";

function Delta({
  current,
  baseline,
  lowerIsBetter,
}: {
  current: number;
  baseline: number;
  lowerIsBetter?: boolean;
}) {
  const raw = current - baseline;
  const good = lowerIsBetter ? raw <= 0 : raw >= 0;
  const label = raw >= 0 ? `+${raw.toFixed(1)}` : raw.toFixed(1);
  return (
    <span className={good ? "text-emerald-400/90" : "text-amber-200/90"}>
      {label}
      <span className="text-zinc-600"> vs baseline</span>
    </span>
  );
}

export function SprintComparisonPanel({ project }: { project: ProjectScenario }) {
  const baseline = computeOnTrackBaseline(project.historicSprints);
  const cur = metricsFromCurrent(project.jira);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h3 className="text-sm font-semibold text-zinc-100">Sprint comparison</h3>
      <p className="mt-1 text-xs text-zinc-500">
        Current sprint ({project.jira.sprintName}) vs the average of{" "}
        <strong className="text-zinc-400">manually tagged</strong> on-track sprints in history.
      </p>

      {!baseline ? (
        <p className="mt-4 text-sm text-amber-200/80">
          No sprints are tagged as on-track yet — tag closed sprints in delivery rituals to build a baseline.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
                <th className="py-2 pr-4">Metric</th>
                <th className="py-2 pr-4">Current</th>
                <th className="py-2 pr-4">
                  On-track baseline{" "}
                  <span className="font-mono text-zinc-600">(n={baseline.count})</span>
                </th>
                <th className="py-2">Delta</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              <tr className="border-b border-zinc-800/80">
                <td className="py-2 pr-4">Sprint completion</td>
                <td className="font-mono">{formatPct(cur.completionPct)}</td>
                <td className="font-mono">{formatPct(baseline.completionPct)}</td>
                <td className="text-xs">
                  <Delta current={cur.completionPct} baseline={baseline.completionPct} />
                </td>
              </tr>
              <tr className="border-b border-zinc-800/80">
                <td className="py-2 pr-4">Scope churn (added / committed)</td>
                <td className="font-mono">{formatPct(cur.scopeChurnPct)}</td>
                <td className="font-mono">{formatPct(baseline.scopeChurnPct)}</td>
                <td className="text-xs">
                  <Delta current={cur.scopeChurnPct} baseline={baseline.scopeChurnPct} lowerIsBetter />
                </td>
              </tr>
              <tr className="border-b border-zinc-800/80">
                <td className="py-2 pr-4">Blocker share of active</td>
                <td className="font-mono">{formatPct(cur.blockerPct)}</td>
                <td className="font-mono">{formatPct(baseline.blockerPct)}</td>
                <td className="text-xs">
                  <Delta current={cur.blockerPct} baseline={baseline.blockerPct} lowerIsBetter />
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Avg cycle time (days)</td>
                <td className="font-mono">{cur.avgCycleDays.toFixed(1)}</td>
                <td className="font-mono">{baseline.avgCycleDays.toFixed(1)}</td>
                <td className="text-xs">
                  <Delta current={cur.avgCycleDays} baseline={baseline.avgCycleDays} lowerIsBetter />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <HistoricSprintTable rows={project.historicSprints} />
    </div>
  );
}

function HistoricSprintTable({ rows }: { rows: HistoricSprint[] }) {
  const sorted = [...rows].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  return (
    <div className="mt-6">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Closed sprint history (mock)
      </h4>
      <div className="mt-2 overflow-x-auto rounded-lg border border-zinc-800/80">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead className="bg-zinc-900/80 text-zinc-500">
            <tr>
              <th className="px-3 py-2">Sprint</th>
              <th className="px-3 py-2">Tagged on-track</th>
              <th className="px-3 py-2">Done / committed</th>
              <th className="px-3 py-2">Scope +</th>
              <th className="px-3 py-2">Blocked / active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 text-zinc-400">
            {sorted.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-2 font-mono text-zinc-200">{r.name}</td>
                <td className="px-3 py-2">
                  {r.taggedOnTrack ? (
                    <span className="text-emerald-400">Yes</span>
                  ) : (
                    <span className="text-zinc-600">No</span>
                  )}
                </td>
                <td className="px-3 py-2 font-mono">
                  {r.completedPoints}/{r.committedPoints}
                </td>
                <td className="px-3 py-2 font-mono">+{r.addedScopePoints}</td>
                <td className="px-3 py-2 font-mono">
                  {r.blockedIssues}/{r.totalActiveIssues}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-zinc-600">
        In production, tags would be edited per sprint; here they are seeded to demo the comparison panel.
      </p>
    </div>
  );
}
