"use client";

import { useEffect, useState } from "react";
import type { AuditLogEntry } from "@/domain/types";
import { readAudit, seedInitialAuditIfEmpty } from "@/lib/demo-store";

export function AuditLogTable() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    seedInitialAuditIfEmpty();
    setEntries(readAudit());
    const t = setInterval(() => setEntries(readAudit()), 1200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-zinc-800 bg-zinc-900/60 text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-4 py-3">Time</th>
            <th className="px-4 py-3">Actor</th>
            <th className="px-4 py-3">Action</th>
            <th className="px-4 py-3">Detail</th>
            <th className="px-4 py-3">Resource</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {entries.map((e) => (
            <tr key={e.id} className="bg-zinc-950/40">
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-400">
                {new Date(e.ts).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-zinc-300">{e.actor}</td>
              <td className="px-4 py-3 font-mono text-xs text-emerald-300/90">{e.action}</td>
              <td className="max-w-md px-4 py-3 text-zinc-500">{e.detail}</td>
              <td className="px-4 py-3 font-mono text-xs text-zinc-600">{e.resource ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
