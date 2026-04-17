import type { UserRole } from "./types";

export function canInstallAgents(role: UserRole): boolean {
  return role === "admin" || role === "editor";
}

export function canRunAgents(role: UserRole): boolean {
  return role === "admin" || role === "editor";
}

export function canManageGovernance(role: UserRole): boolean {
  return role === "admin";
}

export function canApproveRuns(role: UserRole): boolean {
  return role === "admin" || role === "editor";
}

export function canViewAudit(): boolean {
  return true;
}
