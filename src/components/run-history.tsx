"use client";

import { useEffect, useState } from "react";
import { getAgentById } from "@/data/agent-catalog";
import { getProjectById } from "@/data/scenarios";
import type { AgentRun } from "@/domain/types";
import { readRuns, seedInitialAuditIfEmpty } from "@/lib/demo-store";

export function RunHistory() {
  const [runs, setRuns] = useState<AgentRun[]>([]);

  useEffect(() => {
    seedInitialAuditIfEmpty();
    setRuns(readRuns());
    const t = setInterval(() => setRuns(readRuns()), 1000);
    return () => clearInterval(t);
  }, []);

  if (runs.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No runs yet. Install agents from the marketplace or run them from a project or the Agents page.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-zinc-800 bg-zinc-900/60 text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-4 py-3">Started</th>
            <th className="px-4 py-3">Agent</th>
            <th className="px-4 py-3">Project</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Output</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {runs.map((r) => {
            const agent = getAgentById(r.agentId);
            const proj = r.projectId ? getProjectById(r.projectId) : null;
            return (
              <tr key={r.id} className="bg-zinc-950/40">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-400">
                  {new Date(r.startedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-zinc-200">{agent?.name ?? r.agentId}</td>
                <td className="px-4 py-3 text-zinc-400">{proj?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-emerald-950/50 px-2 py-0.5 text-xs text-emerald-300">
                    {r.status}
                  </span>
                </td>
                <td className="max-w-md px-4 py-3 text-xs text-zinc-500">{r.outputSummary}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
