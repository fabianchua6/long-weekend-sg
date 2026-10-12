import { describe, expect, it } from "vitest";
import { buildBreakPlans, effectiveHolidayDates } from "./build-break-plans";
import { YEAR_DATA } from "./data";
import { getPlanOptions, indexPlansByDate, usefulPlans } from "./recommendations";

describe.each([2027, 2028])("%i recommendation mapping", (year) => {
  it.each([false, true])("keeps dates, counts and comparisons consistent (Saturday Monday-off: %s)", (saturdayHolidayPolicy) => {
    const holidays = effectiveHolidayDates(YEAR_DATA[year].holidays, { saturdayHolidayPolicy }, year);
    const plans = usefulPlans(buildBreakPlans(year, { saturdayHolidayPolicy }), holidays);
    const byDate = indexPlansByDate(plans, holidays);
    for (const [date, candidates] of byDate) {
      const options = getPlanOptions(candidates);
      expect(options.length).toBeGreaterThan(0);
      expect(options.length).toBeLessThanOrEqual(3);
      expect(new Set(options.map((plan) => plan.id)).size).toBe(options.length);
      for (const plan of options) {
        expect(plan.dates).toContain(date);
        expect(plan.leaveCost).toBe(plan.leaveDates.length);
        expect(plan.totalDaysOff).toBe(plan.dates.length);
        const weekdaysToBook = plan.dates.filter((day) => {
          const weekday = new Date(`${day}T00:00:00Z`).getUTCDay();
          return weekday !== 0 && weekday !== 6 && !holidays.has(day);
        });
        expect(plan.leaveDates).toEqual(weekdaysToBook);
      }
    }
  });
});

it("offers the natural Good Friday weekend and removes truncated two-day extensions", () => {
  const holidays = effectiveHolidayDates(YEAR_DATA[2027].holidays, {}, 2027);
  const plans = usefulPlans(buildBreakPlans(2027), holidays);
  const options = getPlanOptions(indexPlansByDate(plans, holidays).get("2027-03-26")!);
  expect(options.some((plan) => plan.leaveCost === 0 && plan.totalDaysOff === 3)).toBe(true);
  expect(plans.some((plan) => plan.startDate === "2027-03-25" && plan.endDate === "2027-03-27")).toBe(false);
  expect(plans.some((plan) => plan.startDate === "2027-03-25" && plan.endDate === "2027-03-28")).toBe(true);
});

it("returns no options for an unmarked date", () => expect(getPlanOptions([])).toEqual([]));
