"use client";

import { useEffect, useState } from "react";
import { getAgentById } from "@/data/agent-catalog";
import { getProjectById } from "@/data/scenarios";
import type { ApprovalRequest } from "@/domain/types";
import { useSession } from "@/components/session-context";
import { canApproveRuns } from "@/lib/auth/permissions";
import { approveRequest, readApprovals, rejectRequest, seedInitialAuditIfEmpty } from "@/lib/demo-store";

export function GovernanceApprovals() {
  const session = useSession();
  const allow = canApproveRuns(session.role);
  const [rows, setRows] = useState<ApprovalRequest[]>([]);

  function refresh() {
    seedInitialAuditIfEmpty();
    setRows(readApprovals().filter((r) => r.status === "pending"));
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 1500);
    return () => clearInterval(t);
  }, []);

  function approve(id: string) {
    if (!allow) return;
    approveRequest(id, session.email);
    refresh();
  }

  function reject(id: string) {
    if (!allow) return;
    rejectRequest(id, session.email);
    refresh();
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No pending approvals. Executive-class agents enqueue here before execution.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map((r) => {
        const agent = getAgentById(r.agentId);
        const proj = r.projectId ? getProjectById(r.projectId) : null;
        return (
          <li
            key={r.id}
            className="flex flex-col gap-3 rounded-xl border border-amber-900/40 bg-amber-950/20 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="text-sm">
              <div className="font-medium text-zinc-100">{agent?.name ?? r.agentId}</div>
              <div className="text-xs text-zinc-500">
                Requested by {r.requestedBy} · {new Date(r.requestedAt).toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-zinc-400">Project: {proj?.name ?? "—"}</div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!allow}
                onClick={() => approve(r.id)}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-emerald-950 hover:bg-emerald-500 disabled:opacity-40"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={!allow}
                onClick={() => reject(r.id)}
                className="rounded-lg border border-zinc-600 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
              >
                Reject
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
