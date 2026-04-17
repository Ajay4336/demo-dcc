/** Product positioning for Delivery Command Center — single source for UI copy. */

export const DCC_METRICS = [
  "scope",
  "timeline",
  "quality",
  "cost",
  "operations",
  "team_workload",
] as const;

export const DCC_DATA_INPUTS = ["Jira", "Git", "Test tools", "Incident systems"] as const;

export const DCC_CLIENT_BENEFITS = [
  "early_risk_detection",
  "reduced_manual_reporting",
  "improved_release_predictability",
  "reduced_rework",
  "increased_transparency",
  "faster_agent_deployment",
] as const;

export const DCC_BUSINESS_BENEFITS = [
  "recurring_platform_revenue",
  "marketplace_income",
  "delivery_acceleration",
  "stronger_pre_sales_position",
  "reusable_managed_services",
] as const;

/** Human-readable labels for snake_case keys */
export function labelFromKey(key: string): string {
  if (key === "stronger_pre_sales_position") return "Stronger pre-sales position";
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
