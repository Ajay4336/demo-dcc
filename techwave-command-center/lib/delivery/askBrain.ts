import type { DeliveryAssessment, ProjectScenario } from "@/domain/types";
import { computeRiskComponents } from "@/lib/delivery/scoreProject";

export interface GroundedBrainAnswer {
  text: string;
  /** Field-level citations grounding the reply in project data (Module 4). */
  citations: string[];
}

function citationsForRisk(assessment: DeliveryAssessment, scenario: ProjectScenario): string[] {
  const b = computeRiskComponents(scenario);
  return [
    `riskScore=${assessment.riskScore} (weighted 8-component model)`,
    `confidenceScore=${assessment.confidenceScore} (derived)`,
    `jira.blockedIssues=${scenario.jira.blockedIssues}, jira.totalActiveIssues=${scenario.jira.totalActiveIssues}`,
    `jira.committedPoints=${scenario.jira.committedPoints}, jira.completedPoints=${scenario.jira.completedPoints}`,
    `github.openPullRequests=${scenario.github.openPullRequests}, github.stalePRsOlderThanDays7=${scenario.github.stalePRsOlderThanDays7}`,
    `risk_components: backlog=${b.backlogAgingRisk}, blocker=${b.blockerRisk}, reopen=${b.reopenRisk}, overdue=${b.overdueRisk}, pr_delay=${b.prReviewDelayRisk}, stale_pr=${b.stalePrRisk}, workload=${b.workloadImbalanceRisk}, scope=${b.scopeChurnRisk}`,
  ];
}

export function answerDeliveryBrainGrounded(
  question: string,
  scenario: ProjectScenario,
  assessment: DeliveryAssessment
): GroundedBrainAnswer {
  const q = question.toLowerCase().trim();
  const projectName = scenario.name;
  const baseCites = citationsForRisk(assessment, scenario);

  if (!q) {
    return {
      text: `Ask something about ${projectName}. For example: “Why is risk high?” or “What should we do next?”`,
      citations: baseCites,
    };
  }

  if (/(risk|danger|problem|blocked)/.test(q)) {
    const top = assessment.factors[0];
    return {
      text: [
        `For ${projectName}, delivery risk is ${assessment.riskScore}/100 with confidence ${assessment.confidenceScore}/100.`,
        top
          ? `The strongest signal right now: ${top.label} — ${top.detail}`
          : "No single factor dominates; keep watching throughput vs commitment.",
        `Drivers we are tracking: ${assessment.riskDrivers.slice(0, 3).join("; ") || "none listed"}.`,
      ].join("\n\n"),
      citations: [
        ...baseCites,
        top ? `factor:${top.id}` : "factors=none",
      ],
    };
  }

  if (/(confidence|predict)/.test(q)) {
    return {
      text: `Confidence is modeled from inverse risk pressure and blocker load. Here it is ${assessment.confidenceScore}/100. Raising it usually means reducing blocked work, stabilizing CI, and shortening PR age.`,
      citations: [`confidenceScore=${assessment.confidenceScore}`, `jira.blockedIssues=${scenario.jira.blockedIssues}`],
    };
  }

  if (/(what next|recommend|should we|mitigation|fix)/.test(q)) {
    return {
      text: `Next steps for ${projectName}:\n\n${assessment.recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}`,
      citations: [...baseCites, "recommendations[]=derived-from-factors"],
    };
  }

  if (/(jira|sprint|scope)/.test(q)) {
    return {
      text: "Jira-side signals emphasize commitment vs completed points and blocker concentration. When scope grows faster than completion, risk rises even if the team feels busy.",
      citations: [
        `jira.sprintName=${scenario.jira.sprintName}`,
        `jira.addedScopePoints=${scenario.jira.addedScopePoints}`,
        `jira.committedPoints=${scenario.jira.committedPoints}`,
      ],
    };
  }

  if (/(github|pr|merge|ci)/.test(q)) {
    return {
      text: "GitHub-side signals emphasize PR age, merge latency, and check failures. Stale PRs often mean review capacity or oversized changes—not just developer speed.",
      citations: [
        `github.avgTimeToMergeHours=${scenario.github.avgTimeToMergeHours}`,
        `github.failedChecksLast7d=${scenario.github.failedChecksLast7d}`,
        `github.mainBranchLocked=${scenario.github.mainBranchLocked}`,
      ],
    };
  }

  return {
    text: [
      `I can reason about ${projectName} using the same signals as the dashboard (risk ${assessment.riskScore}, confidence ${assessment.confidenceScore}).`,
      "Try asking about risk, confidence, recommendations, or GitHub/Jira signals.",
    ].join("\n\n"),
    citations: baseCites,
  };
}
