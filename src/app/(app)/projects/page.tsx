import Link from "next/link";
import { PROJECT_SCENARIOS } from "@/data/scenarios";
import { ScoreStrip } from "@/components/score-strip";
import { assessDelivery } from "@/lib/delivery/scoreProject";

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">Projects</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Seeded scenarios with mock Jira + GitHub signals. Open a project for factors, brain Q&amp;A, and
          executive summary.
        </p>
      </div>
      <div className="grid gap-6">
        {PROJECT_SCENARIOS.map((p) => {
          const a = assessDelivery(p);
          return (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="block rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 transition hover:border-emerald-900/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-medium text-zinc-100">{p.name}</h2>
                  <p className="mt-1 max-w-xl text-sm text-zinc-500">{p.description}</p>
                </div>
                <span className="rounded-md bg-zinc-800 px-2 py-1 text-xs font-mono text-zinc-400">
                  {p.id}
                </span>
              </div>
              <div className="mt-6 max-w-xl">
                <ScoreStrip riskScore={a.riskScore} confidenceScore={a.confidenceScore} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
