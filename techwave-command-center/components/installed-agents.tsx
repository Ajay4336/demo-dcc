"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AGENT_CATALOG, getAgentById } from "@/data/agent-catalog";
import { PROJECT_SCENARIOS } from "@/data/scenarios";
import { useSession } from "@/components/session-context";
import { readInstalls, seedInitialAuditIfEmpty, simulateAgentRun } from "@/lib/demo-store";

export function InstalledAgentsPanel() {
  const session = useSession();
  const [installed, setInstalled] = useState<string[]>([]);
  const [projectId, setProjectId] = useState(PROJECT_SCENARIOS[0]?.id ?? "");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    seedInitialAuditIfEmpty();
    setInstalled(readInstalls());
  }, []);

  function run(agentId: string) {
    const p = projectId || null;
    const out = simulateAgentRun({ agentId, projectId: p, actor: session.email, role: session.role });
    if (!out.ok) {
      setMsg(out.reason);
      return;
    }
    setMsg(
      out.run.status === "queued"
        ? "Queued for approval — check Governance."
        : `Run completed for ${getAgentById(agentId)?.name ?? agentId}.`
    );
    setTimeout(() => setMsg(null), 4000);
  }

  const installedAgents = installed
    .map((id) => getAgentById(id))
    .filter(Boolean) as typeof AGENT_CATALOG;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <label className="text-sm">
          <span className="block text-xs font-medium uppercase tracking-wide text-zinc-500">Target project</span>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="mt-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          >
            <option value="">Global (no project)</option>
            {PROJECT_SCENARIOS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <Link href="/marketplace" className="text-sm text-emerald-400/90 hover:underline">
          Browse marketplace →
        </Link>
      </div>

      {installedAgents.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No agents installed yet. Open the marketplace to add Delivery Risk, Executive Summary, or Helpdesk.
        </p>
      ) : (
        <ul className="space-y-3">
          {installedAgents.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3"
            >
              <div>
                <Link href={`/marketplace/${a.id}`} className="font-medium text-emerald-400/90 hover:underline">
                  {a.name}
                </Link>
                <div className="text-xs text-zinc-500">{a.description}</div>
              </div>
              <button
                type="button"
                onClick={() => run(a.id)}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-emerald-950 hover:bg-emerald-500"
              >
                Run agent
              </button>
            </li>
          ))}
        </ul>
      )}

      {msg && <p className="text-sm text-sky-300">{msg}</p>}

      <p className="text-xs text-zinc-600">
        <Link href="/agents/history" className="text-emerald-400/80 hover:underline">
          View run history →
        </Link>
      </p>
    </div>
  );
}
