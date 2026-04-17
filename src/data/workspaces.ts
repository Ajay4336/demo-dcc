import type { Workspace } from "@/lib/auth/types";

export const WORKSPACES: Workspace[] = [
  { id: "ws-acme", name: "Acme Platform", slug: "acme" },
  { id: "ws-northstar", name: "Northstar Labs", slug: "northstar" },
];

export function getWorkspaceById(id: string): Workspace | undefined {
  return WORKSPACES.find((w) => w.id === id);
}
