import type {
  DeliveryAssessment,
  GitHubSignals,
  JiraSignals,
  ProjectScenario,
  RiskFactor,
  RiskSignalBreakdown,
} from "@/domain/types";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** Weights sum to 1.0 */
const W = {
  backlogAging: 0.15,
  blocker: 0.2,
  reopen: 0.15,
  overdue: 0.1,
  prReviewDelay: 0.1,
  stalePr: 0.1,
  workloadImbalance: 0.1,
  scopeChurn: 0.1,
} as const;

function backlogAgingRisk(j: JiraSignals): number {
  return clamp((j.avgCycleTimeDays / 14) * 100, 0, 100);
}

function blockerRisk(j: JiraSignals): number {
  if (j.totalActiveIssues <= 0) return 0;
  return clamp((j.blockedIssues / j.totalActiveIssues) * 120, 0, 100);
}

function reopenRisk(j: JiraSignals): number {
  if (j.reopenedIssues != null && j.totalActiveIssues > 0) {
    return clamp((j.reopenedIssues / j.totalActiveIssues) * 140, 0, 100);
  }
  const creep =
    j.committedPoints > 0 ? j.addedScopePoints / j.committedPoints : 0;
  const slip =
    j.committedPoints > 0 ? 1 - j.completedPoints / j.committedPoints : 0.5;
  return clamp(creep * 35 + slip * 45, 0, 100);
}

function overdueRisk(j: JiraSignals): number {
  if (j.overdueIssues != null && j.totalActiveIssues > 0) {
    return clamp((j.overdueIssues / j.totalActiveIssues) * 120, 0, 100);
  }
  if (j.committedPoints <= 0) return 40;
  return clamp((1 - j.completedPoints / j.committedPoints) * 95, 0, 100);
}

function prReviewDelayRisk(g: GitHubSignals): number {
  return clamp((g.avgTimeToMergeHours / 96) * 100, 0, 100);
}

function stalePrRisk(g: GitHubSignals): number {
  if (g.openPullRequests <= 0) return 0;
  return clamp((g.stalePRsOlderThanDays7 / g.openPullRequests) * 100, 0, 100);
}

/** Proxy when assignee data is absent: WIP depth + PR fan-out. */
function workloadImbalanceRisk(j: JiraSignals, g: GitHubSignals): number {
  const issueLoad = clamp((j.totalActiveIssues / 40) * 55, 0, 55);
  const prFanout = clamp((g.openPullRequests / 25) * 45, 0, 45);
  return clamp(issueLoad + prFanout, 0, 100);
}

function scopeChurnRisk(j: JiraSignals): number {
  if (j.committedPoints <= 0) return 40;
  return clamp((j.addedScopePoints / j.committedPoints) * 85, 0, 100);
}

export function computeRiskComponents(scenario: ProjectScenario): RiskSignalBreakdown {
  const j = scenario.jira;
  const g = scenario.github;
  return {
    backlogAgingRisk: Math.round(backlogAgingRisk(j)),
    blockerRisk: Math.round(blockerRisk(j)),
    reopenRisk: Math.round(reopenRisk(j)),
    overdueRisk: Math.round(overdueRisk(j)),
    prReviewDelayRisk: Math.round(prReviewDelayRisk(g)),
    stalePrRisk: Math.round(stalePrRisk(g)),
    workloadImbalanceRisk: Math.round(workloadImbalanceRisk(j, g)),
    scopeChurnRisk: Math.round(scopeChurnRisk(j)),
  };
}

export function compositeRiskScore(b: RiskSignalBreakdown): number {
  return Math.round(
    W.backlogAging * b.backlogAgingRisk +
      W.blocker * b.blockerRisk +
      W.reopen * b.reopenRisk +
      W.overdue * b.overdueRisk +
      W.prReviewDelay * b.prReviewDelayRisk +
      W.stalePr * b.stalePrRisk +
      W.workloadImbalance * b.workloadImbalanceRisk +
      W.scopeChurn * b.scopeChurnRisk
  );
}

function buildFactors(scenario: ProjectScenario, b: RiskSignalBreakdown): RiskFactor[] {
  const factors: RiskFactor[] = [];
  const j = scenario.jira;
  const g = scenario.github;

  if (b.blockerRisk > 55) {
    factors.push({
      id: "blocked-work",
      label: "Blocked work is dominating active scope",
      severity: b.blockerRisk > 75 ? "critical" : "high",
      detail: `${j.blockedIssues} blocked issues out of ${j.totalActiveIssues} active (${((j.blockedIssues / Math.max(j.totalActiveIssues, 1)) * 100).toFixed(0)}%).`,
      source: "jira",
    });
  }

  if (b.scopeChurnRisk > 50) {
    factors.push({
      id: "scope-creep",
      label: "Scope growth is outpacing the original sprint commitment",
      severity: b.scopeChurnRisk > 70 ? "high" : "medium",
      detail: `Added ${j.addedScopePoints} pts vs ${j.committedPoints} pts committed mid-sprint.`,
      source: "jira",
    });
  }

  if (b.overdueRisk > 50 || b.backlogAgingRisk > 55) {
    factors.push({
      id: "timeline-pressure",
      label: "Timeline pressure from aging work and/or sprint slip",
      severity: b.overdueRisk > 65 ? "high" : "medium",
      detail: `Overdue proxy ${b.overdueRisk}/100; backlog aging signal ${b.backlogAgingRisk}/100 (~${j.avgCycleTimeDays.toFixed(1)}d avg cycle).`,
      source: "derived",
    });
  }

  if (b.reopenRisk > 50) {
    factors.push({
      id: "reopen-instability",
      label: "Reopen / churn instability in delivery",
      severity: "medium",
      detail:
        j.reopenedIssues != null
          ? `${j.reopenedIssues} reopened issues in scope (synced field).`
          : "Reopen signal estimated from scope and completion volatility (no reopen count in mock).",
      source: j.reopenedIssues != null ? "jira" : "derived",
    });
  }

  if (b.stalePrRisk > 45) {
    factors.push({
      id: "stale-prs",
      label: "Review and merge latency is creating a PR backlog",
      severity: b.stalePrRisk > 65 ? "high" : "medium",
      detail: `${g.stalePRsOlderThanDays7} PRs older than 7 days across ${g.openPullRequests} open PRs.`,
      source: "github",
    });
  }

  if (b.prReviewDelayRisk > 45) {
    factors.push({
      id: "merge-time",
      label: "PR cycle / review-to-merge delay is elevated",
      severity: b.prReviewDelayRisk > 70 ? "high" : "medium",
      detail: `Average time to merge is ${g.avgTimeToMergeHours}h (proxy for review delay stack).`,
      source: "github",
    });
  }

  if (b.workloadImbalanceRisk > 55) {
    factors.push({
      id: "workload-imbalance",
      label: "WIP depth and PR fan-out suggest uneven load",
      severity: "medium",
      detail: `Workload imbalance signal ${b.workloadImbalanceRisk}/100 (${j.totalActiveIssues} active issues, ${g.openPullRequests} open PRs).`,
      source: "derived",
    });
  }

  if (g.failedChecksLast7d >= 3) {
    factors.push({
      id: "ci-noise",
      label: "CI instability is adding rework and review thrash",
      severity: g.failedChecksLast7d >= 5 ? "medium" : "low",
      detail: `${g.failedChecksLast7d} failed check runs in the last 7 days.`,
      source: "github",
    });
  }

  if (g.mainBranchLocked) {
    factors.push({
      id: "main-frozen",
      label: "Main branch protections are pausing integration",
      severity: "medium",
      detail: "Release train or hotfix policy has the default branch effectively frozen.",
      source: "github",
    });
  }

  return factors;
}

function recommendationsFromFactors(factors: RiskFactor[]): string[] {
  const recs: string[] = [];
  const labels = new Set(factors.map((f) => f.id));

  if (labels.has("blocked-work")) {
    recs.push("Run a 48h unblock swarm: assign owners per blocker and cap WIP until flow returns.");
  }
  if (labels.has("scope-creep")) {
    recs.push("Re-baseline scope with product: freeze non-critical additions until the current commitment is green.");
  }
  if (labels.has("stale-prs") || labels.has("merge-time")) {
    recs.push("Institute daily PR triage with a merge SLA and split oversized diffs.");
  }
  if (labels.has("ci-noise")) {
    recs.push("Stabilize CI: flake detection on main, required checks narrowed to merge-blocking only.");
  }
  if (labels.has("main-frozen")) {
    recs.push("Publish a clear integration window or feature-flag workflow so teams can keep shipping.");
  }
  if (labels.has("timeline-pressure")) {
    recs.push("Timebox overdue work: daily aging review and escalate dependencies blocking the sprint.");
  }
  if (labels.has("reopen-instability")) {
    recs.push("Reduce rework: tighten DoD and root-cause top reopen drivers before adding scope.");
  }
  if (labels.has("workload-imbalance")) {
    recs.push("Rebalance ownership: cap issues per contributor and pair on the hottest PRs.");
  }
  if (recs.length === 0) {
    recs.push("Keep monitoring: maintain stand-up focus on leading indicators (blockers, aging PRs).");
  }
  return recs.slice(0, 5);
}

export function getRiskSignalBreakdown(scenario: ProjectScenario): RiskSignalBreakdown {
  return computeRiskComponents(scenario);
}

export function assessDelivery(scenario: ProjectScenario): DeliveryAssessment {
  const b = computeRiskComponents(scenario);
  const riskScore = compositeRiskScore(b);

  const stabilityBonus =
    scenario.jira.blockedIssues === 0 ? 6 : scenario.jira.blockedIssues < 3 ? 3 : 0;
  const confidenceScore = clamp(
    Math.round(100 - riskScore * 0.82 + stabilityBonus),
    0,
    100
  );

  const factors = buildFactors(scenario, b);
  const riskDrivers = factors.slice(0, 4).map((f) => f.label);
  const recommendations = recommendationsFromFactors(factors);

  return {
    riskScore,
    confidenceScore,
    factors,
    riskDrivers,
    recommendations,
  };
}

export function buildInternalExecutiveSummary(scenario: ProjectScenario): string {
  const a = assessDelivery(scenario);
  const b = computeRiskComponents(scenario);
  const riskLabel =
    a.riskScore >= 70 ? "elevated" : a.riskScore >= 45 ? "moderate" : "controlled";

  return [
    `[INTERNAL] ${scenario.name}`,
    "",
    "Signals (mock):",
    `- Jira ${scenario.jira.projectKey} sprint ${scenario.jira.sprintName}: committed ${scenario.jira.committedPoints}, completed ${scenario.jira.completedPoints}, scope +${scenario.jira.addedScopePoints}, blocked ${scenario.jira.blockedIssues}/${scenario.jira.totalActiveIssues}.`,
    `- GitHub ${scenario.github.repo}: open PRs ${scenario.github.openPullRequests}, stale ${scenario.github.stalePRsOlderThanDays7}, merge ${scenario.github.avgTimeToMergeHours}h, CI fails 7d ${scenario.github.failedChecksLast7d}, main lock ${scenario.github.mainBranchLocked}.`,
    "",
    "Risk engine (0–100 components, weighted sum):",
    `- backlog_aging ${b.backlogAgingRisk}, blocker ${b.blockerRisk}, reopen ${b.reopenRisk}, overdue ${b.overdueRisk}`,
    `- pr_review_delay ${b.prReviewDelayRisk}, stale_pr ${b.stalePrRisk}, workload_imbalance ${b.workloadImbalanceRisk}, scope_churn ${b.scopeChurnRisk}`,
    `- Composite risk ${a.riskScore}/100 (${riskLabel}), confidence ${a.confidenceScore}/100`,
    "",
    "Top factors:",
    ...a.factors.slice(0, 5).map((f) => `- [${f.severity}] ${f.label}: ${f.detail}`),
    "",
    "Next moves:",
    ...a.recommendations.map((r) => `- ${r}`),
  ].join("\n");
}

export function buildClientExecutiveSummary(scenario: ProjectScenario): string {
  const a = assessDelivery(scenario);
  const riskLabel =
    a.riskScore >= 70 ? "elevated" : a.riskScore >= 45 ? "moderate" : "controlled";

  const top = a.factors.slice(0, 3).map((f) => f.label).join("; ");
  const recs = a.recommendations.slice(0, 3).map((r) => `- ${r}`).join("\n");

  return [
    `${scenario.name} — delivery snapshot`,
    "",
    scenario.description,
    "",
    `Overall delivery risk is ${riskLabel} (${a.riskScore}/100). Confidence in the current plan is ${a.confidenceScore}/100, based on weighted backlog, blocker, reopen, overdue, PR flow, and scope signals.`,
    "",
    `Themes to address: ${top || "No major themes flagged."}`,
    "",
    "Recommended focus:",
    recs,
    "",
    "Prepared by Delivery Command Center (demo).",
  ].join("\n");
}

/** @deprecated Use buildClientExecutiveSummary for stakeholder text. */
export function executiveSummaryMarkdown(scenario: ProjectScenario): string {
  return buildClientExecutiveSummary(scenario);
}
