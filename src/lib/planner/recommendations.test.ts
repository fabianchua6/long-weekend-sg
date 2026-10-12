import { describe, expect, it } from "vitest";
import { buildBreakPlans, effectiveHolidayDates } from "./build-break-plans";
import { YEAR_DATA } from "./data";
import { featuredBreakPlans, getPlanOptions, indexPlansByDate, rangeEdges, usefulPlans } from "./recommendations";

describe.each([2027, 2028])("%i recommendation mapping", (year) => {
  it.each([false, true])("keeps dates, counts and comparisons consistent (Saturday Monday-off: %s)", (saturdayHolidayPolicy) => {
    const holidays = effectiveHolidayDates(YEAR_DATA[year].holidays, { saturdayHolidayPolicy }, year);
    const plans = usefulPlans(buildBreakPlans(year, { saturdayHolidayPolicy }), holidays);
    const featured = featuredBreakPlans(plans);
    const byDate = indexPlansByDate(plans, holidays, featured);
    expect(featured.length).toBeGreaterThan(0);
    const featuredDates = featured.flatMap((plan) => plan.dates);
    expect(new Set(featuredDates).size).toBe(featuredDates.length);
    const anchorDates = featured.flatMap((plan) => plan.anchorHolidays.map((holiday) => holiday.date));
    expect(new Set(anchorDates).size).toBe(anchorDates.length);
    for (const plan of featured) {
      expect(plan.totalDaysOff).toBeGreaterThanOrEqual(4);
      expect(plan.leaveCost).toBeGreaterThan(0);
      expect(plan.leaveCost).toBeLessThanOrEqual(4);
      for (const date of plan.dates) expect(getPlanOptions(byDate.get(date)!)[0].id).toBe(plan.id);
    }
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

it("rounds caps at week and month boundaries, including leap day", () => {
  const holidays = effectiveHolidayDates(YEAR_DATA[2027].holidays, {}, 2027);
  const crossMonth = usefulPlans(buildBreakPlans(2027), holidays).find((plan) => plan.startDate === "2027-04-30" && plan.endDate === "2027-05-03")!;
  expect(crossMonth).toBeDefined();
  expect(rangeEdges("2027-04-30", crossMonth)).toEqual({ start: true, end: true });
  expect(rangeEdges("2027-05-01", crossMonth)).toEqual({ start: true, end: false });
  expect(rangeEdges("2027-05-02", crossMonth)).toEqual({ start: false, end: true });
  expect(rangeEdges("2027-05-03", crossMonth)).toEqual({ start: true, end: true });
  const leapRange = { ...crossMonth, startDate: "2028-02-28" as const, endDate: "2028-03-03" as const };
  expect(rangeEdges("2028-02-29", leapRange)).toEqual({ start: false, end: true });
  expect(rangeEdges("2028-03-01", leapRange)).toEqual({ start: true, end: false });
});
