"use client";

import { useEffect, useState } from "react";
import { AGENT_CATALOG } from "@/data/agent-catalog";
import { useSession } from "@/components/session-context";
import {
  addInstall,
  readInstalls,
  seedInitialAuditIfEmpty,
  simulateAgentRun,
} from "@/lib/demo-store";

export function ProjectAgentPanel({ projectId }: { projectId: string }) {
  const session = useSession();
  const [installed, setInstalled] = useState<string[]>([]);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    seedInitialAuditIfEmpty();
    setInstalled(readInstalls());
  }, []);

  const riskAgent = AGENT_CATALOG.find((a) => a.kind === "delivery_risk");
  const execAgent = AGENT_CATALOG.find((a) => a.kind === "executive_summary");

  function ensureInstall(id: string) {
    setInstalled(addInstall(id));
  }

  function run(agentId: string) {
    ensureInstall(agentId);
    const out = simulateAgentRun({
      agentId,
      projectId,
      actor: session.email,
      role: session.role,
    });
    if (!out.ok) {
      setNote(out.reason);
      return;
    }
    setNote(
      out.run.status === "queued"
        ? "Run queued — executive-class agent requires approval (see Governance)."
        : "Agent run recorded. Check Agents → History and Governance."
    );
    setTimeout(() => setNote(null), 6000);
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h3 className="text-sm font-semibold text-zinc-100">Run agents on this project</h3>
      <p className="mt-1 text-xs text-zinc-500">
        Installs agents if needed, then records a governed run + audit entry. Viewers cannot run agents.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {riskAgent && (
          <button
            type="button"
            onClick={() => run(riskAgent.id)}
            className="rounded-lg border border-emerald-700/50 bg-emerald-950/40 px-3 py-2 text-xs font-medium text-emerald-200 hover:bg-emerald-900/50"
          >
            Run Delivery Risk Agent
          </button>
        )}
        {execAgent && (
          <button
            type="button"
            onClick={() => run(execAgent.id)}
            className="rounded-lg border border-amber-700/40 bg-amber-950/30 px-3 py-2 text-xs font-medium text-amber-100 hover:bg-amber-900/40"
          >
            Run Executive Summary Agent
          </button>
        )}
      </div>
      {note && <p className="mt-3 text-xs text-sky-300 whitespace-pre-wrap">{note}</p>}
      <p className="mt-3 text-[10px] text-zinc-600">
        Installed agent IDs: {installed.length ? installed.join(", ") : "none yet"}
      </p>
    </div>
  );
}
