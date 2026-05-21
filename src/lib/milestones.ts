import data from '../data/milestones/standard.json';
import type { MilestoneDefinition } from '../types';

const RAW: { milestones: MilestoneDefinition[] } = data as { milestones: MilestoneDefinition[] };

export const STANDARD_MILESTONES: MilestoneDefinition[] = RAW.milestones;

export interface MilestoneGroup {
  ageMonths: number;
  milestones: MilestoneDefinition[];
}

export function groupMilestonesByAge(
  milestones: MilestoneDefinition[] = STANDARD_MILESTONES,
): MilestoneGroup[] {
  const map = new Map<number, MilestoneDefinition[]>();
  for (const m of milestones) {
    const list = map.get(m.recommendedAgeMonths) ?? [];
    list.push(m);
    map.set(m.recommendedAgeMonths, list);
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([ageMonths, items]) => ({ ageMonths, milestones: items }));
}

export function formatAgeMonths(months: number): string {
  if (months < 12) return `${months} mo`;
  if (months % 12 === 0) return `${months / 12} y`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return `${y} y ${m} mo`;
}
