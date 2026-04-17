"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/components/session-context";
import { canManageGovernance } from "@/lib/auth/permissions";
import { appendAudit, readKillSwitch, writeKillSwitch } from "@/lib/demo-store";

export function GovernanceKillSwitch() {
  const session = useSession();
  const allow = canManageGovernance(session.role);
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(readKillSwitch());
  }, []);

  function toggle() {
    if (!allow) return;
    const next = !on;
    writeKillSwitch(next);
    setOn(next);
    appendAudit({
      actor: session.email,
      action: next ? "policy.kill_switch.on" : "policy.kill_switch.off",
      detail: next ? "Agent runtime disabled globally." : "Agent runtime re-enabled.",
      resource: "policy/kill-switch",
    });
  }

  return (
    <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-rose-100">Kill switch</h3>
          <p className="mt-1 text-xs text-rose-200/70">
            When enabled, all agent installs and runs are blocked (demo: browser store). Admins only.
          </p>
        </div>
        <button
          type="button"
          disabled={!allow}
          onClick={toggle}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            on
              ? "bg-rose-600 text-white hover:bg-rose-500"
              : "border border-zinc-600 text-zinc-300 hover:bg-zinc-800"
          } disabled:cursor-not-allowed disabled:opacity-40`}
        >
          {on ? "Kill switch ON" : "Kill switch OFF"}
        </button>
      </div>
      {!allow && <p className="mt-2 text-xs text-zinc-500">Only workspace admins can toggle the kill switch.</p>}
    </div>
  );
}
