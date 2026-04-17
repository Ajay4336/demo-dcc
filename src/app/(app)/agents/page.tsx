import { InstalledAgentsPanel } from "@/components/installed-agents";

export default function AgentsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">Agents</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Installed agents and quick runs. History and approvals surface on the next screens.
        </p>
      </div>
      <InstalledAgentsPanel />
    </div>
  );
}
