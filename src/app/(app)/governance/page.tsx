import { GovernanceApprovals } from "@/components/governance-approvals";
import { GovernanceKillSwitch } from "@/components/governance-kill-switch";
import { AuditLogTable } from "@/components/audit-log";

export default function GovernancePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">Governance &amp; audit</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Policy controls, approvals for executive-class agents, and an append-only style audit trail (demo:
          local browser storage).
        </p>
      </div>

      <GovernanceKillSwitch />

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Approvals</h2>
        <p className="mt-1 text-xs text-zinc-600">
          Agents tagged with approval required enqueue a run request. Editors and admins can resolve.
        </p>
        <div className="mt-4">
          <GovernanceApprovals />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Policy labels</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Each marketplace agent ships with labels such as <code className="text-zinc-300">egress:none</code>,{" "}
          <code className="text-zinc-300">approval:required</code>, and{" "}
          <code className="text-zinc-300">workspace:data</code>. Use them in policy engines and SOC reviews.
        </p>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Audit log</h2>
        <div className="mt-4">
          <AuditLogTable />
        </div>
      </section>
    </div>
  );
}
