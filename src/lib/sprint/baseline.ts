import type { HistoricSprint, JiraSignals } from "@/domain/types";

export interface SprintMetrics {
  completionPct: number;
  scopeChurnPct: number;
  blockerPct: number;
  avgCycleDays: number;
}

function metricsFromJiraLike(input: {
  committedPoints: number;
  completedPoints: number;
  addedScopePoints: number;
  blockedIssues: number;
  totalActiveIssues: number;
  avgCycleTimeDays: number;
}): SprintMetrics {
  const c = Math.max(input.committedPoints, 0.0001);
  const completionPct = (input.completedPoints / c) * 100;
  const scopeChurnPct = (input.addedScopePoints / c) * 100;
  const ta = Math.max(input.totalActiveIssues, 1);
  const blockerPct = (input.blockedIssues / ta) * 100;
  return {
    completionPct,
    scopeChurnPct,
    blockerPct,
    avgCycleDays: input.avgCycleTimeDays,
  };
}

export function metricsFromHistoric(s: HistoricSprint): SprintMetrics {
  return metricsFromJiraLike(s);
}

export function metricsFromCurrent(j: JiraSignals): SprintMetrics {
  return metricsFromJiraLike(j);
}

function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export interface OnTrackBaseline {
  count: number;
  completionPct: number;
  scopeChurnPct: number;
  blockerPct: number;
  avgCycleDays: number;
}

export function computeOnTrackBaseline(historic: HistoricSprint[]): OnTrackBaseline | null {
  const tagged = historic.filter((h) => h.taggedOnTrack);
  if (tagged.length === 0) return null;
  const m = tagged.map(metricsFromHistoric);
  return {
    count: tagged.length,
    completionPct: mean(m.map((x) => x.completionPct)),
    scopeChurnPct: mean(m.map((x) => x.scopeChurnPct)),
    blockerPct: mean(m.map((x) => x.blockerPct)),
    avgCycleDays: mean(m.map((x) => x.avgCycleDays)),
  };
}

export function formatPct(n: number) {
  return `${n.toFixed(1)}%`;
}
