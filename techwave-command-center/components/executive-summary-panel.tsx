"use client";

import { useState } from "react";
import { useSession } from "@/components/session-context";
import type { ExecutiveSummaryVersion } from "@/domain/types";
import { appendSummaryVersion, readSummaries } from "@/lib/demo-store";

type Tab = "internal" | "client";

export function ExecutiveSummaryPanel({
  projectId,
  internalBody,
  clientBody,
}: {
  projectId: string;
  internalBody: string;
  clientBody: string;
}) {
  const session = useSession();
  const [tab, setTab] = useState<Tab>("client");
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [versionEpoch, setVersionEpoch] = useState(0);

  const versions = readSummaries().filter((v) => v.projectId === projectId);

  const body = tab === "internal" ? internalBody : clientBody;

  async function copy() {
    await navigator.clipboard.writeText(body);
    setSavedMsg("Copied to clipboard.");
    setTimeout(() => setSavedMsg(null), 2000);
  }

  function saveVersion() {
    const row: ExecutiveSummaryVersion = {
      id: crypto.randomUUID(),
      projectId,
      createdAt: new Date().toISOString(),
      createdBy: session.email,
      internalBody,
      clientBody,
    };
    appendSummaryVersion(row);
    setVersionEpoch((e) => e + 1);
    setSavedMsg("Version saved to local history.");
    setTimeout(() => setSavedMsg(null), 2500);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setTab("client")}
          className={`rounded-lg px-3 py-1.5 text-sm ${
            tab === "client" ? "bg-emerald-900/50 text-emerald-100" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Client-ready
        </button>
        <button
          type="button"
          onClick={() => setTab("internal")}
          className={`rounded-lg px-3 py-1.5 text-sm ${
            tab === "internal" ? "bg-sky-900/40 text-sky-100" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Internal
        </button>
        <div className="ml-auto flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copy}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
          >
            Copy
          </button>
          <button
            type="button"
            onClick={saveVersion}
            className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-white"
          >
            Save version
          </button>
        </div>
      </div>
      <div className="whitespace-pre-wrap rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6 font-sans text-sm leading-relaxed text-zinc-300">
        {body}
      </div>
      {savedMsg && <p className="text-xs text-sky-300">{savedMsg}</p>}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Version history</h3>
        <ul key={versionEpoch} className="mt-2 space-y-2 text-xs text-zinc-500">
          {versions.length === 0 && <li>No saved versions yet.</li>}
          {versions.map((v) => (
            <li key={v.id} className="flex flex-wrap gap-2 rounded-lg border border-zinc-800/80 bg-zinc-900/30 px-3 py-2">
              <span className="font-mono text-zinc-400">{new Date(v.createdAt).toLocaleString()}</span>
              <span>·</span>
              <span>{v.createdBy}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
