function Bar({ value, label, tone }: { value: number; label: string; tone: "risk" | "confidence" }) {
  const color =
    tone === "risk"
      ? value >= 70
        ? "bg-amber-500"
        : value >= 45
          ? "bg-amber-400/80"
          : "bg-emerald-500/70"
      : value >= 65
        ? "bg-emerald-400"
        : value >= 40
          ? "bg-sky-500/80"
          : "bg-rose-500/70";

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</span>
        <span className="font-mono text-lg tabular-nums text-zinc-100">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function ScoreStrip({
  riskScore,
  confidenceScore,
}: {
  riskScore: number;
  confidenceScore: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Bar value={riskScore} label="Delivery risk" tone="risk" />
      <Bar value={confidenceScore} label="Confidence" tone="confidence" />
    </div>
  );
}
