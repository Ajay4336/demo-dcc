"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AgentDefinition } from "@/domain/types";
import { useSession } from "@/components/session-context";
import { canInstallAgents } from "@/lib/auth/permissions";
import { addInstall, readInstalls, removeInstall, seedInitialAuditIfEmpty, appendAudit } from "@/lib/demo-store";

export function MarketplaceList({ agents }: { agents: AgentDefinition[] }) {
  const session = useSession();
  const [installed, setInstalled] = useState<string[]>([]);
  const allowInstall = canInstallAgents(session.role);

  useEffect(() => {
    seedInitialAuditIfEmpty();
    setInstalled(readInstalls());
  }, []);

  function install(id: string) {
    if (!allowInstall) return;
    const next = addInstall(id);
    setInstalled(next);
    appendAudit({
      actor: session.email,
      action: "agent.install",
      detail: `Installed agent ${id}`,
      resource: id,
    });
  }

  function uninstall(id: string) {
    if (!allowInstall) return;
    const next = removeInstall(id);
    setInstalled(next);
    appendAudit({
      actor: session.email,
      action: "agent.uninstall",
      detail: `Removed agent ${id}`,
      resource: id,
    });
  }

  return (
    <ul className="space-y-4">
      {agents.map((a) => {
        const on = installed.includes(a.id);
        return (
          <li
            key={a.id}
            className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/marketplace/${a.id}`} className="text-lg font-medium text-emerald-400/90 hover:underline">
                  {a.name}
                </Link>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                  v{a.version}
                </span>
                {a.requiredApproval && (
                  <span className="rounded border border-amber-800/60 bg-amber-950/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-200">
                    approval required
                  </span>
                )}
              </div>
              <p className="mt-2 max-w-2xl text-sm text-zinc-500">{a.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {a.policyLabels.map((label) => (
                  <span
                    key={label}
                    className="rounded-md border border-zinc-700/80 bg-zinc-950/60 px-2 py-0.5 font-mono text-[10px] text-zinc-400"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              {on ? (
                <button
                  type="button"
                  disabled={!allowInstall}
                  onClick={() => uninstall(a.id)}
                  className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!allowInstall}
                  onClick={() => install(a.id)}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Install
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
