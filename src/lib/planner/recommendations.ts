import { addDays } from "./build-break-plans";
import type { BreakPlan, DateString, Holiday } from "./types";

/** Drop partial breaks that omit a free adjacent day in the displayed year. */
export function usefulPlans(plans: BreakPlan[], holidayDates: Map<DateString, Holiday[]>) {
  const isFree = (date: DateString) => {
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
    return weekday === 0 || weekday === 6 || holidayDates.has(date);
  };
  return plans.filter((plan) => {
    if (plan.totalDaysOff < 3 || plan.totalDaysOff < plan.leaveCost + 2) return false;
    const before = addDays(plan.startDate, -1);
    const after = addDays(plan.endDate, 1);
    return !(before.slice(0, 4) === plan.startDate.slice(0, 4) && isFree(before)) &&
      !(after.slice(0, 4) === plan.endDate.slice(0, 4) && isFree(after));
  });
}

export function indexPlansByDate(plans: BreakPlan[], holidayDates: Map<DateString, Holiday[]>) {
  const map = new Map<DateString, BreakPlan[]>();
  for (const plan of plans) {
    const leaveDates = new Set(plan.leaveDates);
    for (const date of plan.dates) {
      if (!leaveDates.has(date) && !holidayDates.has(date)) continue;
      const candidates = map.get(date) ?? [];
      candidates.push(plan);
      map.set(date, candidates);
    }
  }
  return map;
}

/** Stable choices for an anchor date, independent of the currently selected option. */
export function getPlanOptions(candidates: BreakPlan[]): BreakPlan[] {
  const best = candidates.find((plan) => plan.leaveCost > 0) ?? candidates[0];
  if (!best) return [];
  const options = [best];
  const natural = candidates.find((plan) => plan.leaveCost === 0);
  if (natural && natural.id !== best.id) options.push(natural);
  const longest = candidates.reduce((result, plan) =>
    plan.totalDaysOff > result.totalDaysOff ||
    (plan.totalDaysOff === result.totalDaysOff && plan.leaveCost < result.leaveCost) ? plan : result, best);
  if (!options.some((plan) => plan.id === longest.id)) options.push(longest);
  for (const plan of candidates) {
    if (options.length === 3) break;
    if (!options.some((option) => option.leaveCost === plan.leaveCost)) options.push(plan);
  }
  return options;
}
