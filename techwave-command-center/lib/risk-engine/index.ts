/**
 * Module 3 — Risk engine
 *
 * Deterministic rules-based scoring from Jira + GitHub-shaped signals.
 * Severity and factors are derived in `scoreProject.ts`; this module is the stable entrypoint.
 */
export {
  assessDelivery,
  buildClientExecutiveSummary,
  buildInternalExecutiveSummary,
  compositeRiskScore,
  computeRiskComponents,
  getRiskSignalBreakdown,
} from "@/lib/delivery/scoreProject";
