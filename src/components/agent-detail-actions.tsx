"use client";

import { useEffect, useState } from "react";
import { getAgentById } from "@/data/agent-catalog";
import { useSession } from "@/components/session-context";
import { canInstallAgents } from "@/lib/auth/permissions";
import { addInstall, readInstalls, removeInstall, appendAudit } from "@/lib/demo-store";

export function AgentDetailActions({ agentId }: { agentId: string }) {
  const session = useSession();
  const [installed, setInstalled] = useState(false);
  const allow = canInstallAgents(session.role);
  const agent = getAgentById(agentId);

  useEffect(() => {
    setInstalled(readInstalls().includes(agentId));
  }, [agentId]);

  function toggle() {
    if (!allow || !agent) return;
    if (installed) {
      removeInstall(agentId);
      appendAudit({ actor: session.email, action: "agent.uninstall", detail: agentId, resource: agentId });
    } else {
      addInstall(agentId);
      appendAudit({ actor: session.email, action: "agent.install", detail: agentId, resource: agentId });
    }
    setInstalled(readInstalls().includes(agentId));
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <button
        type="button"
        disabled={!allow}
        onClick={toggle}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {installed ? "Installed — click to remove" : "Install agent"}
      </button>
      {!allow && (
        <span className="text-xs text-amber-200/90">Viewers cannot install or remove agents.</span>
      )}
      <a
        href="/agents"
        className="text-sm text-emerald-400/90 hover:underline"
      >
        Go to Agents →
      </a>
    </div>
  );
}
