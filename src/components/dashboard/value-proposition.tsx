import {
  DCC_BUSINESS_BENEFITS,
  DCC_CLIENT_BENEFITS,
  DCC_DATA_INPUTS,
  DCC_METRICS,
  labelFromKey,
} from "@/content/dcc-positioning";

export function ValueProposition() {
  return (
    <section className="space-y-8 rounded-2xl border border-zinc-800/90 bg-zinc-900/25 p-6 md:p-8">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-400/90">Metrics</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {DCC_METRICS.map((m) => (
            <li
              key={m}
              className="rounded-lg border border-zinc-700/80 bg-zinc-950/60 px-3 py-1.5 text-sm text-zinc-200"
            >
              {labelFromKey(m)}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-400/90">Data inputs</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {DCC_DATA_INPUTS.map((d) => (
            <li
              key={d}
              className="rounded-lg border border-violet-900/40 bg-violet-950/30 px-3 py-1.5 text-sm text-violet-100/90"
            >
              {d}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-zinc-600">
          Jira and Git are wired as demos today; test tools and incident systems plug into the same connector layer.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-400/90">Client benefits</h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            {DCC_CLIENT_BENEFITS.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="text-emerald-500/80">✓</span>
                <span>{labelFromKey(b)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-400/90">Business benefits</h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            {DCC_BUSINESS_BENEFITS.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="text-sky-500/80">✓</span>
                <span>{labelFromKey(b)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
