export type FactorSeverity = "critical" | "high" | "medium" | "low";

export type SignalSource = "jira" | "github" | "derived";

export interface RiskFactor {
  id: string;
  label: string;
  severity: FactorSeverity;
  detail: string;
  source: SignalSource;
}

export interface JiraSignals {
  projectKey: string;
  sprintName: string;
  committedPoints: number;
  completedPoints: number;
  addedScopePoints: number;
  blockedIssues: number;
  totalActiveIssues: number;
  avgCycleTimeDays: number;
  /** Issues past due (when synced from Jira). Omitted in mock → overdue risk uses sprint slip proxy. */
  overdueIssues?: number;
  /** Reopened issues in window (when synced). Omitted → reopen risk uses stability proxy. */
  reopenedIssues?: number;
}

export interface GitHubSignals {
  repo: string;
  openPullRequests: number;
  stalePRsOlderThanDays7: number;
  avgTimeToMergeHours: number;
  failedChecksLast7d: number;
  mainBranchLocked: boolean;
}

/** Closed sprint snapshot; `taggedOnTrack` is a manual “successful / on track” baseline for comparisons. */
export interface HistoricSprint {
  id: string;
  name: string;
  taggedOnTrack: boolean;
  committedPoints: number;
  completedPoints: number;
  addedScopePoints: number;
  blockedIssues: number;
  totalActiveIssues: number;
  avgCycleTimeDays: number;
}

export interface ProjectScenario {
  id: string;
  name: string;
  description: string;
  jira: JiraSignals;
  github: GitHubSignals;
  /** Past closed sprints (mock). Compare current `jira` to sprints marked `taggedOnTrack`. */
  historicSprints: HistoricSprint[];
}

export interface DeliveryAssessment {
  riskScore: number;
  confidenceScore: number;
  factors: RiskFactor[];
  riskDrivers: string[];
  recommendations: string[];
}

/**
 * Eight 0–100 sub-scores combined as:
 * risk = 0.15*backlog + 0.20*blocker + 0.15*reopen + 0.10*overdue + 0.10*prReviewDelay
 *     + 0.10*stalePr + 0.10*workload + 0.10*scopeChurn
 */
export interface RiskSignalBreakdown {
  backlogAgingRisk: number;
  blockerRisk: number;
  reopenRisk: number;
  overdueRisk: number;
  prReviewDelayRisk: number;
  stalePrRisk: number;
  workloadImbalanceRisk: number;
  scopeChurnRisk: number;
}

export type AgentKind = "delivery_risk" | "executive_summary" | "helpdesk";

export interface AgentDefinition {
  id: string;
  kind: AgentKind;
  name: string;
  description: string;
  requiredApproval: boolean;
  version: string;
  policyLabels: string[];
}

export interface ApprovalRequest {
  id: string;
  agentId: string;
  projectId: string | null;
  requestedBy: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface ExecutiveSummaryVersion {
  id: string;
  projectId: string;
  createdAt: string;
  createdBy: string;
  internalBody: string;
  clientBody: string;
}

export interface AgentRun {
  id: string;
  agentId: string;
  projectId: string | null;
  status: "queued" | "running" | "succeeded" | "failed";
  startedAt: string;
  finishedAt: string | null;
  outputSummary: string;
}

export interface AuditLogEntry {
  id: string;
  ts: string;
  actor: string;
  action: string;
  detail: string;
  resource?: string;
}
