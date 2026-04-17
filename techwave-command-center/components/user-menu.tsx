"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SessionPayload } from "@/lib/auth/types";

export function UserMenu({ session }: { session: SessionPayload }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs">
      <div className="font-medium text-zinc-200">{session.name}</div>
      <div className="truncate text-zinc-500">{session.email}</div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[10px] uppercase text-zinc-400">
          {session.role}
        </span>
        <button
          type="button"
          onClick={logout}
          disabled={pending}
          className="text-emerald-400/90 hover:underline disabled:opacity-50"
        >
          {pending ? "…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}
