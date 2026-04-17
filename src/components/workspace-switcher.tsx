"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { WORKSPACES } from "@/data/workspaces";

export function WorkspaceSwitcher({
  currentId,
  disabled,
}: {
  currentId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function change(ws: string) {
    if (ws === currentId) return;
    setPending(true);
    try {
      await fetch("/api/auth/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: ws }),
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <label className="text-xs">
      <span className="sr-only">Workspace</span>
      <select
        value={currentId}
        disabled={disabled || pending}
        onChange={(e) => change(e.target.value)}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-zinc-200 disabled:opacity-50"
      >
        {WORKSPACES.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>
    </label>
  );
}
