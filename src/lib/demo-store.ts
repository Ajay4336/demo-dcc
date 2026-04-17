"use client";

import { getAgentById } from "@/data/agent-catalog";
import type {
  AgentRun,
  ApprovalRequest,
  AuditLogEntry,
  ExecutiveSummaryVersion,
} from "@/domain/types";
import type { UserRole } from "@/lib/auth/types";

const NS = "dcc/v1";
const KEY_INSTALLS = `${NS}/installs`;
const KEY_RUNS = `${NS}/runs`;
const KEY_AUDIT = `${NS}/audit`;
const KEY_APPROVALS = `${NS}/approvals`;
const KEY_SUMMARIES = `${NS}/summaries`;
const KEY_KILL = `${NS}/kill-switch`;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readKillSwitch(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY_KILL) === "1";
}

export function writeKillSwitch(on: boolean) {
  localStorage.setItem(KEY_KILL, on ? "1" : "0");
}

export function readInstalls(): string[] {
  if (typeof window === "undefined") return [];
  return safeParse<string[]>(localStorage.getItem(KEY_INSTALLS), []);
}

export function writeInstalls(ids: string[]) {
  localStorage.setItem(KEY_INSTALLS, JSON.stringify(ids));
}

export function addInstall(agentId: string): string[] {
  const cur = readInstalls();
  if (cur.includes(agentId)) return cur;
  const next = [...cur, agentId];
  writeInstalls(next);
  return next;
}

export function removeInstall(agentId: string): string[] {
  const next = readInstalls().filter((id) => id !== agentId);
  writeInstalls(next);
  return next;
}

export function readRuns(): AgentRun[] {
  if (typeof window === "undefined") return [];
  return safeParse<AgentRun[]>(localStorage.getItem(KEY_RUNS), []);
}

function writeRuns(runs: AgentRun[]) {
  localStorage.setItem(KEY_RUNS, JSON.stringify(runs));
}

export function appendRun(run: AgentRun) {
  const runs = readRuns();
  writeRuns([run, ...runs].slice(0, 200));
}

export function readApprovals(): ApprovalRequest[] {
  if (typeof window === "undefined") return [];
  return safeParse<ApprovalRequest[]>(localStorage.getItem(KEY_APPROVALS), []);
}

function writeApprovals(rows: ApprovalRequest[]) {
  localStorage.setItem(KEY_APPROVALS, JSON.stringify(rows));
}

export function readSummaries(): ExecutiveSummaryVersion[] {
  if (typeof window === "undefined") return [];
  return safeParse<ExecutiveSummaryVersion[]>(localStorage.getItem(KEY_SUMMARIES), []);
}

function writeSummaries(rows: ExecutiveSummaryVersion[]) {
  localStorage.setItem(KEY_SUMMARIES, JSON.stringify(rows));
}

export function appendSummaryVersion(row: ExecutiveSummaryVersion) {
  const cur = readSummaries();
  writeSummaries([row, ...cur].slice(0, 50));
}

export function readAudit(): AuditLogEntry[] {
  if (typeof window === "undefined") return [];
  return safeParse<AuditLogEntry[]>(localStorage.getItem(KEY_AUDIT), []);
}

function writeAudit(entries: AuditLogEntry[]) {
  localStorage.setItem(KEY_AUDIT, JSON.stringify(entries));
}

export function appendAudit(entry: Omit<AuditLogEntry, "id" | "ts"> & { id?: string; ts?: string }) {
  const entries = readAudit();
  const full: AuditLogEntry = {
    id: entry.id ?? crypto.randomUUID(),
    ts: entry.ts ?? new Date().toISOString(),
    actor: entry.actor,
    action: entry.action,
    detail: entry.detail,
    resource: entry.resource,
  };
  writeAudit([full, ...entries].slice(0, 500));
}

export function seedInitialAuditIfEmpty() {
  if (typeof window === "undefined") return;
  if (readAudit().length > 0) return;
  const seed: AuditLogEntry[] = [
    {
      id: "seed-1",
      ts: new Date(Date.now() - 86400000 * 2).toISOString(),
      actor: "system",
      action: "policy.apply",
      detail: "Default agent policy: Executive Summary requires approval.",
      resource: "policy/default",
    },
    {
      id: "seed-2",
      ts: new Date(Date.now() - 86400000).toISOString(),
      actor: "demo.user@company.test",
      action: "marketplace.view",
      detail: "Opened agent marketplace.",
      resource: "marketplace",
    },
  ];
  writeAudit(seed);
}

export function approveRequest(id: string, actor: string) {
  const rows = readApprovals();
  const next = rows.map((r) =>
    r.id === id ? { ...r, status: "approved" as const } : r
  );
  writeApprovals(next);
  appendAudit({
    actor,
    action: "approval.resolve",
    detail: `Approved request ${id.slice(0, 8)}…`,
    resource: id,
  });
}

export function rejectRequest(id: string, actor: string) {
  const rows = readApprovals();
  const next = rows.map((r) =>
    r.id === id ? { ...r, status: "rejected" as const } : r
  );
  writeApprovals(next);
  appendAudit({
    actor,
    action: "approval.reject",
    detail: `Rejected request ${id.slice(0, 8)}…`,
    resource: id,
  });
}

export type SimulateOutcome =
  | { ok: true; run: AgentRun }
  | { ok: false; reason: string };

export function simulateAgentRun(params: {
  agentId: string;
  projectId: string | null;
  actor?: string;
  role: UserRole;
}): SimulateOutcome {
  if (readKillSwitch()) {
    appendAudit({
      actor: params.actor ?? "unknown",
      action: "agent.blocked",
      detail: "Kill switch enabled; agent runtime disabled.",
      resource: params.agentId,
    });
    return { ok: false, reason: "Kill switch is ON — agent runtime disabled (Governance)." };
  }

  if (params.role === "viewer") {
    appendAudit({
      actor: params.actor ?? "unknown",
      action: "agent.denied",
      detail: "Viewer role cannot run agents.",
      resource: params.agentId,
    });
    return { ok: false, reason: "Viewers cannot run agents." };
  }

  const agent = getAgentById(params.agentId);
  if (!agent) {
    return { ok: false, reason: "Unknown agent." };
  }

  if (agent.requiredApproval) {
    const id = crypto.randomUUID();
    const row: ApprovalRequest = {
      id,
      agentId: params.agentId,
      projectId: params.projectId,
      requestedBy: params.actor ?? "unknown",
      requestedAt: new Date().toISOString(),
      status: "pending",
    };
    writeApprovals([row, ...readApprovals()].slice(0, 100));
    appendAudit({
      actor: params.actor ?? "unknown",
      action: "agent.approval.requested",
      detail: `Executive-class agent queued for approval (${agent.name}).`,
      resource: id,
    });
    const run: AgentRun = {
      id: crypto.randomUUID(),
      agentId: params.agentId,
      projectId: params.projectId,
      status: "queued",
      startedAt: new Date().toISOString(),
      finishedAt: null,
      outputSummary: "Awaiting approval before execution (governed path).",
    };
    appendRun(run);
    return { ok: true, run };
  }

  const id = crypto.randomUUID();
  const startedAt = new Date().toISOString();
  const run: AgentRun = {
    id,
    agentId: params.agentId,
    projectId: params.projectId,
    status: "succeeded",
    startedAt,
    finishedAt: new Date(Date.now() + 400).toISOString(),
    outputSummary:
      params.agentId === "agent-delivery-risk"
        ? "Risk narrative and mitigations written to workspace buffer (demo)."
        : params.agentId === "agent-executive-summary"
          ? "Executive summary draft generated (demo)."
          : "Helpdesk reply drafted from runbooks index (demo).",
  };
  appendRun(run);
  appendAudit({
    actor: params.actor ?? "demo.user@company.test",
    action: "agent.run",
    detail: `Completed run ${id.slice(0, 8)}… for agent ${params.agentId}`,
    resource: params.projectId ?? "global",
  });
  return { ok: true, run };
}
