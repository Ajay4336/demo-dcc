import type { GitHubSignals, JiraSignals } from "@/domain/types";

export function JiraCard({ j }: { j: JiraSignals }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-zinc-100">Jira (simulated)</h3>
        <span className="rounded bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-violet-300">
          {j.projectKey}
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-zinc-500">Sprint</dt>
        <dd className="text-right font-mono text-zinc-200">{j.sprintName}</dd>
        <dt className="text-zinc-500">Committed pts</dt>
        <dd className="text-right font-mono text-zinc-200">{j.committedPoints}</dd>
        <dt className="text-zinc-500">Completed</dt>
        <dd className="text-right font-mono text-zinc-200">{j.completedPoints}</dd>
        <dt className="text-zinc-500">Scope added</dt>
        <dd className="text-right font-mono text-amber-200/90">+{j.addedScopePoints}</dd>
        <dt className="text-zinc-500">Blocked / active</dt>
        <dd className="text-right font-mono text-zinc-200">
          {j.blockedIssues} / {j.totalActiveIssues}
        </dd>
        <dt className="text-zinc-500">Avg cycle (d)</dt>
        <dd className="text-right font-mono text-zinc-200">{j.avgCycleTimeDays.toFixed(1)}</dd>
      </dl>
    </div>
  );
}

export function GitHubCard({ g }: { g: GitHubSignals }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-zinc-100">GitHub (simulated)</h3>
        <span className="rounded bg-slate-500/20 px-2 py-0.5 text-[10px] font-medium text-slate-300">
          {g.repo}
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-zinc-500">Open PRs</dt>
        <dd className="text-right font-mono text-zinc-200">{g.openPullRequests}</dd>
        <dt className="text-zinc-500">Stale PRs (&gt;7d)</dt>
        <dd className="text-right font-mono text-amber-200/90">{g.stalePRsOlderThanDays7}</dd>
        <dt className="text-zinc-500">Avg merge (h)</dt>
        <dd className="text-right font-mono text-zinc-200">{g.avgTimeToMergeHours}</dd>
        <dt className="text-zinc-500">Failed checks (7d)</dt>
        <dd className="text-right font-mono text-zinc-200">{g.failedChecksLast7d}</dd>
        <dt className="text-zinc-500">Main frozen</dt>
        <dd className="text-right font-mono text-zinc-200">{g.mainBranchLocked ? "yes" : "no"}</dd>
      </dl>
    </div>
  );
}
