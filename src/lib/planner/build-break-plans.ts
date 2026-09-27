import { YEAR_DATA } from "./data";
import type { BreakPlan, DateString, Holiday, PlannerPreferences, YearData } from "./types";

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Convert a Date or ISO date-like value into a validated UTC date key. */
export function dateKey(value: Date | string): DateString {
  if (typeof value === "string") {
    const match = DATE_PATTERN.exec(value);
    if (!match) throw new Error(`Expected a YYYY-MM-DD date, received: ${value}`);
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const utc = new Date(Date.UTC(year, month - 1, day));
    if (
      utc.getUTCFullYear() !== year ||
      utc.getUTCMonth() !== month - 1 ||
      utc.getUTCDate() !== day
    ) {
      throw new Error(`Invalid calendar date: ${value}`);
    }
    return value as DateString;
  }

  if (Number.isNaN(value.getTime())) throw new Error("Cannot create a date key from an invalid Date");
  return `${value.getUTCFullYear().toString().padStart(4, "0")}-${(value.getUTCMonth() + 1)
    .toString()
    .padStart(2, "0")}-${value.getUTCDate().toString().padStart(2, "0")}` as DateString;
}

function toUtcDate(value: Date | string): Date {
  const key = dateKey(value);
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function addDays(value: Date | string, amount: number): DateString {
  const date = toUtcDate(value);
  date.setUTCDate(date.getUTCDate() + amount);
  return dateKey(date);
}

export function daysBetween(start: Date | string, end: Date | string): number {
  return Math.round((toUtcDate(end).getTime() - toUtcDate(start).getTime()) / 86_400_000);
}

/** Return every date in an inclusive range, without using local timezone parsing. */
export function datesInRange(start: Date | string, end: Date | string): DateString[] {
  const first = dateKey(start);
  const last = dateKey(end);
  const length = daysBetween(first, last);
  if (length < 0) return [];
  return Array.from({ length: length + 1 }, (_, index) => addDays(first, index));
}

function dayOfWeek(value: Date | string): number {
  return toUtcDate(value).getUTCDay();
}

function isWeekday(value: Date | string): boolean {
  const day = dayOfWeek(value);
  return day !== 0 && day !== 6;
}

function resolveInput(
  input: YearData | Holiday[] | number,
  preferences: PlannerPreferences,
): { year: number; holidays: Holiday[] } {
  if (typeof input === "number") {
    const yearData = YEAR_DATA[input];
    if (!yearData) throw new Error(`Unsupported planner year: ${input}`);
    return { year: preferences.year ?? preferences.selectedYear ?? input, holidays: yearData.holidays };
  }
  if (Array.isArray(input)) {
    const yearFromData = input[0] ? Number(input[0].date.slice(0, 4)) : preferences.year ?? preferences.selectedYear;
    if (!yearFromData) throw new Error("A year is required when building plans from an empty holiday list");
    return { year: preferences.year ?? preferences.selectedYear ?? yearFromData, holidays: input };
  }
  return { year: preferences.year ?? preferences.selectedYear ?? input.year, holidays: input.holidays };
}

function shouldApplySaturdayWorkplacePolicy(preferences: PlannerPreferences): boolean {
  return Boolean(preferences.saturdayHolidayPolicy || preferences.saturdayHolidayObserved);
}

/**
 * Expand each holiday into the dates available to a Monday-Friday worker.
 * Sunday in-lieu days are automatic under Singapore's Employment Act rules;
 * Saturday in-lieu days are opt-in because employers may provide pay instead.
 */
function effectiveHolidayDates(
  holidays: Holiday[],
  preferences: PlannerPreferences,
  year: number,
): Map<DateString, Holiday[]> {
  const byDate = new Map<DateString, Holiday[]>();
  const add = (date: DateString, holiday: Holiday) => {
    if (Number(date.slice(0, 4)) !== year) return;
    const existing = byDate.get(date) ?? [];
    if (!existing.includes(holiday)) existing.push(holiday);
    byDate.set(date, existing);
  };

  for (const holiday of holidays) {
    add(holiday.date, holiday);
    if (holiday.observedDate) {
      add(holiday.observedDate, holiday);
    } else if (dayOfWeek(holiday.date) === 0) {
      add(addDays(holiday.date, 1), holiday);
    } else if (dayOfWeek(holiday.date) === 6 && shouldApplySaturdayWorkplacePolicy(preferences)) {
      add(addDays(holiday.date, 2), holiday);
    }
  }
  return byDate;
}

function planComparator(a: BreakPlan, b: BreakPlan): number {
  return (
    b.efficiency - a.efficiency ||
    b.totalDaysOff - a.totalDaysOff ||
    a.leaveCost - b.leaveCost ||
    a.startDate.localeCompare(b.startDate) ||
    a.endDate.localeCompare(b.endDate)
  );
}

export function buildBreakPlans(
  input: YearData | Holiday[] | number,
  preferences: PlannerPreferences = {},
): BreakPlan[] {
  const { year, holidays } = resolveInput(input, preferences);
  const holidayDates = effectiveHolidayDates(holidays, preferences, year);
  const yearStart = `${year.toString().padStart(4, "0")}-01-01` as DateString;
  const yearEnd = `${year.toString().padStart(4, "0")}-12-31` as DateString;
  const dates = datesInRange(yearStart, yearEnd);
  const plans = new Map<string, BreakPlan>();

  // A range only needs to grow until its fifth non-holiday weekday. Once that
  // happens, adding more days can never bring its leave cost back under four.
  for (let startIndex = 0; startIndex < dates.length; startIndex += 1) {
    const leaveDates: DateString[] = [];
    let containsHoliday = false;

    for (let endIndex = startIndex; endIndex < dates.length; endIndex += 1) {
      const currentDate = dates[endIndex];
      if (holidayDates.has(currentDate)) containsHoliday = true;
      if (isWeekday(currentDate) && !holidayDates.has(currentDate)) leaveDates.push(currentDate);
      if (leaveDates.length > 4) break;
      if (!containsHoliday) continue;

      const rangeDates = dates.slice(startIndex, endIndex + 1);
      const startDate = dates[startIndex];
      const endDate = currentDate;
      const id = `${startDate}:${endDate}`;
      const anchorMap = new Map<Holiday, Holiday>();
      for (const date of rangeDates) {
        for (const holiday of holidayDates.get(date) ?? []) anchorMap.set(holiday, holiday);
      }
      const totalDaysOff = rangeDates.length;
      const leaveCost = leaveDates.length;
      const plan: BreakPlan = {
        id,
        range: { start: startDate, end: endDate },
        startDate,
        endDate,
        dates: rangeDates,
        anchorHolidays: [...anchorMap.keys()],
        leaveDates: [...leaveDates],
        leaveDays: [...leaveDates],
        leaveCost,
        totalDaysOff,
        daysOff: totalDaysOff,
        efficiency: totalDaysOff / Math.max(leaveCost, 1),
      };
      plans.set(id, plan);
    }
  }

  return [...plans.values()].sort(planComparator);
}

export { effectiveHolidayDates };
