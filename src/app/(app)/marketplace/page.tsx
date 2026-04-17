import { MarketplaceList } from "@/components/marketplace-list";
import { AGENT_CATALOG } from "@/data/agent-catalog";

export default function MarketplacePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">Agent marketplace</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Install reusable agents into your workspace (stored locally for this demo). Runs and policy events
          show under Governance.
        </p>
      </div>
      <MarketplaceList agents={AGENT_CATALOG} />
    </div>
  );
}
