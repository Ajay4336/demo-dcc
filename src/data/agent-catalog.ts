import type { AgentDefinition } from "@/domain/types";

export const AGENT_CATALOG: AgentDefinition[] = [
  {
    id: "agent-delivery-risk",
    kind: "delivery_risk",
    name: "Delivery Risk Agent",
    description:
      "Explains current risk drivers, confidence level, and prioritized mitigation steps for a project.",
    requiredApproval: false,
    version: "1.2.0",
    policyLabels: ["workspace:data", "egress:none", "human:review-optional"],
  },
  {
    id: "agent-executive-summary",
    kind: "executive_summary",
    name: "Executive Summary Agent",
    description:
      "Produces a stakeholder-ready narrative from delivery signals and factor breakdown.",
    requiredApproval: true,
    version: "0.9.1",
    policyLabels: ["workspace:data", "egress:llm-optional", "approval:required"],
  },
  {
    id: "agent-helpdesk",
    kind: "helpdesk",
    name: "Helpdesk Agent",
    description:
      "Routes common engineering questions and links to runbooks (governed, read-only by default).",
    requiredApproval: false,
    version: "0.4.0",
    policyLabels: ["kb:internal-only", "egress:none", "pii:block"],
  },
];

export function getAgentById(id: string) {
  return AGENT_CATALOG.find((a) => a.id === id);
}
