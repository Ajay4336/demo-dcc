import type { SessionPayload } from "./types";

/** Edge-safe session decode (middleware). Keep in sync with `encodeSession` payloads (ASCII-safe JSON). */
export function decodeSessionEdge(raw: string): SessionPayload | null {
  try {
    const json = atob(raw);
    const o = JSON.parse(json) as SessionPayload;
    if (!o?.email || !o?.role || !o?.workspaceId) return null;
    return o;
  } catch {
    return null;
  }
}
