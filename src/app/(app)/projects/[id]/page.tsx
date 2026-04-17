import Link from "next/link";
import { notFound } from "next/navigation";
import { AskBrainChat } from "@/components/ask-brain-chat";
import { ExecutiveSummaryPanel } from "@/components/executive-summary-panel";
import { FactorList } from "@/components/factor-list";
import { HealthOverview } from "@/components/health-overview";
import { GitHubCard, JiraCard } from "@/components/integration-cards";
import { ProjectAgentPanel } from "@/components/project-agent-panel";
import { RiskBreakdownChart } from "@/components/risk-breakdown-chart";
import { ScoreStrip } from "@/components/score-strip";
import { SprintComparisonPanel } from "@/components/projects/sprint-comparison-panel";
import { SprintStatus } from "@/components/sprint-status";
import { getProjectById } from "@/data/scenarios";
import {
  assessDelivery,
  buildClientExecutiveSummary,
  buildInternalExecutiveSummary,
  getRiskSignalBreakdown,
} from "@/lib/delivery/scoreProject";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = getProjectById(id);
  if (!project) notFound();

  const assessment = assessDelivery(project);
  const breakdown = getRiskSignalBreakdown(project);
  const internalSummary = buildInternalExecutiveSummary(project);
  const clientSummary = buildClientExecutiveSummary(project);

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <Link href="/projects" className="text-xs font-medium text-emerald-400/90 hover:underline">
          ← Projects
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">{project.name}</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">{project.description}</p>
      </div>

      <HealthOverview assessment={assessment} />

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Scores</h2>
        <div className="mt-4 max-w-xl">
          <ScoreStrip riskScore={assessment.riskScore} confidenceScore={assessment.confidenceScore} />
        </div>
        <p className="mt-4 text-xs text-zinc-600">
          Risk aggregates blocker load, scope creep, throughput, and GitHub flow. Confidence moves with that
          aggregate and blocker penalties.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <SprintStatus j={project.jira} />
        <RiskBreakdownChart breakdown={breakdown} />
      </section>

      <SprintComparisonPanel project={project} />

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Factor breakdown</h2>
          <div className="mt-4">
            <FactorList factors={assessment.factors} />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Why it matters</h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-zinc-300">
            {assessment.riskDrivers.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-zinc-500">Recommendations</h3>
          <ul className="mt-2 space-y-2 text-sm text-zinc-300">
            {assessment.recommendations.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-emerald-500/80">→</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <JiraCard j={project.jira} />
        <GitHubCard g={project.github} />
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Ask the Delivery Brain</h2>
        <p className="mt-1 text-xs text-zinc-600">
          Grounded Q&amp;A from the same project record — deterministic routing with optional LLM polish via env.
        </p>
        <div className="mt-4">
          <AskBrainChat projectName={project.name} scenario={project} assessment={assessment} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Executive summary</h2>
        <p className="mt-1 text-xs text-zinc-600">
          Internal vs client-ready narratives, local version history, copy and export.
        </p>
        <div className="mt-4">
          <ExecutiveSummaryPanel
            projectId={project.id}
            internalBody={internalSummary}
            clientBody={clientSummary}
          />
        </div>
      </section>

      <section>
        <ProjectAgentPanel projectId={project.id} />
      </section>
    </div>
  );
}
