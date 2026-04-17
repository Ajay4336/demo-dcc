import Link from "next/link";
import { notFound } from "next/navigation";
import { AgentDetailActions } from "@/components/agent-detail-actions";
import { getAgentById } from "@/data/agent-catalog";

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = getAgentById(id);
  if (!agent) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link href="/marketplace" className="text-xs font-medium text-emerald-400/90 hover:underline">
        ← Marketplace
      </Link>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">{agent.name}</h1>
        <p className="mt-2 text-sm text-zinc-500">{agent.description}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded bg-zinc-800 px-2 py-1 font-mono text-zinc-400">v{agent.version}</span>
          <span className="rounded bg-zinc-800 px-2 py-1 font-mono text-zinc-400">{agent.kind}</span>
          {agent.requiredApproval && (
            <span className="rounded border border-amber-800/60 bg-amber-950/40 px-2 py-1 text-amber-200">
              approval required to run
            </span>
          )}
        </div>
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Policy labels</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {agent.policyLabels.map((label) => (
            <li
              key={label}
              className="rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2 font-mono text-xs text-zinc-300"
            >
              {label}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Runtime (Module 7)</h2>
        <p className="mt-2 text-sm text-zinc-400">
          This agent executes in the governed runtime: installs and runs are audited. Executive-class agents may
          require approval before side effects.
        </p>
      </section>

      <AgentDetailActions agentId={agent.id} />
    </div>
  );
}
