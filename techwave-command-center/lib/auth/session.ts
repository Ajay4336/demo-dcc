import { cookies } from "next/headers";
import type { SessionPayload } from "./types";
import { SESSION_COOKIE } from "./types";

export function encodeSession(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
}

export function decodeSession(raw: string): SessionPayload | null {
  try {
    const json = Buffer.from(raw, "base64").toString("utf8");
    const o = JSON.parse(json) as SessionPayload;
    if (!o?.email || !o?.role || !o?.workspaceId) return null;
    return o;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return decodeSession(raw);
}
