export type UserRole = "admin" | "editor" | "viewer";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
}

export interface SessionPayload {
  email: string;
  name: string;
  role: UserRole;
  workspaceId: string;
}

export const SESSION_COOKIE = "dcc-session";
