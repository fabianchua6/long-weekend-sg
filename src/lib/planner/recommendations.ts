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

/** One best-value extended break per holiday cluster, without overlapping bands. */
export function featuredBreakPlans(plans: BreakPlan[]): BreakPlan[] {
  const featured: BreakPlan[] = [];
  const usedDates = new Set<DateString>();
  const usedHolidays = new Set<DateString>();
  for (const plan of plans) {
    if (plan.leaveCost === 0 || plan.totalDaysOff < 4) continue;
    if (plan.dates.some((date) => usedDates.has(date)) ||
      plan.anchorHolidays.some((holiday) => usedHolidays.has(holiday.date))) continue;
    featured.push(plan);
    plan.dates.forEach((date) => usedDates.add(date));
    plan.anchorHolidays.forEach((holiday) => usedHolidays.add(holiday.date));
  }
  return featured;
}

/** Close each capsule at a week/month edge, including cross-month breaks. */
export function rangeEdges(date: DateString, plan: BreakPlan) {
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  return {
    start: date === plan.startDate || date.endsWith("-01") || weekday === 1,
    end: date === plan.endDate || addDays(date, 1).slice(0, 7) !== date.slice(0, 7) || weekday === 0,
  };
}

export function indexPlansByDate(plans: BreakPlan[], holidayDates: Map<DateString, Holiday[]>, featured: BreakPlan[] = []) {
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
  // Every date in a visible band opens that exact plan, including weekends.
  for (const plan of featured) {
    for (const date of plan.dates) {
      const candidates = plans.filter((candidate) => candidate.dates.includes(date));
      map.set(date, [plan, ...candidates.filter((candidate) => candidate.id !== plan.id)]);
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
