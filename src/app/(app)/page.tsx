import Link from "next/link";
import { ValueProposition } from "@/components/dashboard/value-proposition";
import { PROJECT_SCENARIOS } from "@/data/scenarios";
import { assessDelivery } from "@/lib/delivery/scoreProject";

export default function DashboardPage() {
  const snapshot = PROJECT_SCENARIOS.map((p) => ({
    project: p,
    ...assessDelivery(p),
  }));
  const avgRisk = Math.round(
    snapshot.reduce((s, x) => s + x.riskScore, 0) / Math.max(snapshot.length, 1)
  );
  const avgConf = Math.round(
    snapshot.reduce((s, x) => s + x.confidenceScore, 0) / Math.max(snapshot.length, 1)
  );

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">Delivery Command Center</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Detect hidden delivery risk early from Jira and GitHub signals (demo data), then act with governed
          agents. This MVP uses simulated integrations and local run history.
        </p>
      </div>

      <ValueProposition />

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">Projects tracked</div>
          <div className="mt-2 font-mono text-3xl text-zinc-100">{PROJECT_SCENARIOS.length}</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">Avg delivery risk</div>
          <div className="mt-2 font-mono text-3xl text-amber-200">{avgRisk}</div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">Avg confidence</div>
          <div className="mt-2 font-mono text-3xl text-emerald-200">{avgConf}</div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Portfolio snapshot</h2>
        <ul className="mt-4 space-y-3">
          {snapshot.map((row) => (
            <li key={row.project.id}>
              <Link
                href={`/projects/${row.project.id}`}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-800/90 bg-zinc-900/40 px-4 py-3 transition hover:border-emerald-900/50 hover:bg-zinc-900/70"
              >
                <div>
                  <div className="font-medium text-zinc-100">{row.project.name}</div>
                  <div className="text-xs text-zinc-500">{row.project.description}</div>
                </div>
                <div className="flex gap-6 font-mono text-sm">
                  <span className="text-amber-200/90">risk {row.riskScore}</span>
                  <span className="text-emerald-200/90">conf {row.confidenceScore}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
