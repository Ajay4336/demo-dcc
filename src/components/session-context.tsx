"use client";

import { createContext, useContext } from "react";
import type { SessionPayload } from "@/lib/auth/types";

const SessionContext = createContext<SessionPayload | null>(null);

export function SessionProvider({
  session,
  children,
}: {
  session: SessionPayload;
  children: React.ReactNode;
}) {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionPayload {
  const s = useContext(SessionContext);
  if (!s) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return s;
}
