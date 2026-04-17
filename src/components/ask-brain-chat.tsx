"use client";

import { useState } from "react";
import type { DeliveryAssessment, ProjectScenario } from "@/domain/types";
import { answerDeliveryBrainGrounded } from "@/lib/delivery/askBrain";

export function AskBrainChat({
  projectName,
  scenario,
  assessment,
}: {
  projectName: string;
  scenario: ProjectScenario;
  assessment: DeliveryAssessment;
}) {
  const [q, setQ] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "brain"; text: string; citations?: string[] }[]
  >([
    {
      role: "brain",
      text: `I am the Delivery Brain for ${projectName}. Answers are grounded in this project’s Jira + GitHub signals (demo).`,
    },
  ]);

  const polishNote =
    process.env.NEXT_PUBLIC_DELIVERY_BRAIN_POLISH === "1"
      ? "LLM polish flag is on (wire your model here)."
      : null;

  function send() {
    const text = q.trim();
    if (!text) return;
    const { text: reply, citations } = answerDeliveryBrainGrounded(text, scenario, assessment);
    setMessages((m) => [
      ...m,
      { role: "user", text },
      { role: "brain", text: reply, citations },
    ]);
    setQ("");
  }

  return (
    <div className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/30">
      {polishNote && (
        <div className="border-b border-zinc-800 px-4 py-2 text-[11px] text-sky-300/90">{polishNote}</div>
      )}
      <div className="max-h-96 space-y-3 overflow-y-auto p-4 text-sm leading-relaxed">
        {messages.map((m, i) => (
          <div key={i}>
            <div
              className={
                m.role === "user"
                  ? "ml-8 whitespace-pre-wrap rounded-lg bg-emerald-950/50 px-3 py-2 text-emerald-50"
                  : "mr-8 whitespace-pre-wrap rounded-lg bg-zinc-800/60 px-3 py-2 text-zinc-200"
              }
            >
              {m.text}
            </div>
            {m.role === "brain" && m.citations && m.citations.length > 0 && (
              <div className="mr-8 mt-1 flex flex-wrap gap-1">
                {m.citations.slice(0, 6).map((c) => (
                  <span
                    key={c}
                    className="max-w-[200px] truncate rounded border border-zinc-700/80 bg-zinc-950/80 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500"
                    title={c}
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 border-t border-zinc-800 p-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask the Delivery Brain…"
          className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-600 focus:outline-none"
        />
        <button
          type="button"
          onClick={send}
          className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-500"
        >
          Send
        </button>
      </div>
    </div>
  );
}
