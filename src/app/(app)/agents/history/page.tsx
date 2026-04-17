import { RunHistory } from "@/components/run-history";

export default function AgentHistoryPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">Agent run history</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Persisted in your browser for this MVP (replace with Supabase or your control plane).
        </p>
      </div>
      <RunHistory />
    </div>
  );
}
