import { describe, expect, it } from "vitest";
import {
  HOLIDAYS,
  HOLIDAYS_2027,
  HOLIDAYS_2028,
  SCHOOL_BREAKS_2027,
  YEAR_DATA,
} from "./data";
import {
  buildBreakPlans,
  dateKey,
  datesInRange,
} from "./build-break-plans";
import type { Holiday } from "./types";

describe("UTC-safe date helpers", () => {
  it("does not shift date-only strings with the machine timezone", () => {
    expect(dateKey("2028-02-29")).toBe("2028-02-29");
    expect(datesInRange("2028-02-28", "2028-03-01")).toEqual([
      "2028-02-28",
      "2028-02-29",
      "2028-03-01",
    ]);
  });

  it("rejects malformed and impossible calendar dates", () => {
    expect(() => dateKey("2027-2-01")).toThrow();
    expect(() => dateKey("2027-02-30")).toThrow();
  });
});

describe("versioned fixtures", () => {
  it("contains the complete 11-day MOM 2027 fixture", () => {
    expect(HOLIDAYS_2027).toHaveLength(11);
    expect(HOLIDAYS_2027.every((holiday) => holiday.status === "official")).toBe(true);
    expect(HOLIDAYS_2027.find((holiday) => holiday.date === "2027-02-07")?.observedDate).toBe(
      "2027-02-08",
    );
    expect(HOLIDAYS[2027]).toBe(HOLIDAYS_2027);
  });

  it("contains the full MOE 2027 vacation and special-school-day fixture", () => {
    expect(SCHOOL_BREAKS_2027).toHaveLength(11);
    expect(SCHOOL_BREAKS_2027.find((item) => item.label === "Term 2 school holidays")).toMatchObject({
      startDate: "2027-05-29",
      endDate: "2027-06-27",
      status: "official",
    });
    expect(SCHOOL_BREAKS_2027.find((item) => item.label === "Children's Day")?.appliesTo).toBe(
      "primary",
    );
  });

  it("keeps every 2028 date provisional, including forecast confidence", () => {
    expect(HOLIDAYS_2028).toHaveLength(11);
    expect(HOLIDAYS_2028.every((holiday) => holiday.status === "forecast")).toBe(true);
    expect(HOLIDAYS_2028.every((holiday) => holiday.forecastConfidence)).toBe(true);
    expect(HOLIDAYS_2028.find((holiday) => holiday.name === "Hari Raya Puasa")).toMatchObject({
      date: "2028-02-27",
      observedDate: "2028-02-28",
      forecastConfidence: "low",
    });
  });
});

describe("buildBreakPlans", () => {
  it("models 2027 Chinese New Year Sunday with its official Monday observed holiday", () => {
    const plans = buildBreakPlans(YEAR_DATA[2027]);
    const naturalCny = plans.find(
      (plan) => plan.startDate === "2027-02-06" && plan.endDate === "2027-02-08" && plan.leaveCost === 0,
    );

    expect(naturalCny).toBeDefined();
    expect(naturalCny?.totalDaysOff).toBe(3);
    expect(naturalCny?.anchorHolidays.map((holiday) => holiday.name)).toContain(
      "Chinese New Year (second day)",
    );
  });

  it("keeps Saturday holidays conservative unless the workplace policy is enabled", () => {
    const saturdayHoliday: Holiday = {
      name: "Test Saturday holiday",
      date: "2027-01-02",
      status: "official",
      sourceUrl: "https://example.com",
      verifiedOn: "2027-01-01",
    };

    const conservative = buildBreakPlans([saturdayHoliday], { year: 2027 });
    const withWorkplacePolicy = buildBreakPlans([saturdayHoliday], {
      year: 2027,
      saturdayHolidayPolicy: true,
    });

    expect(
      conservative.some((plan) => plan.startDate === "2027-01-02" && plan.endDate === "2027-01-04" && plan.leaveCost === 0),
    ).toBe(false);
    expect(
      withWorkplacePolicy.some(
        (plan) => plan.startDate === "2027-01-02" && plan.endDate === "2027-01-04" && plan.leaveCost === 0,
      ),
    ).toBe(true);
  });

  it("supports a holiday break that crosses a month boundary", () => {
    const sundayHoliday: Holiday = {
      name: "Month-end Sunday holiday",
      date: "2027-01-31",
      status: "official",
      sourceUrl: "https://example.com",
      verifiedOn: "2027-01-01",
    };
    const plans = buildBreakPlans([sundayHoliday], { year: 2027 });
    const plan = plans.find((candidate) => candidate.startDate === "2027-01-30" && candidate.endDate === "2027-02-01");

    expect(plan?.dates).toEqual(["2027-01-30", "2027-01-31", "2027-02-01"]);
    expect(plan?.leaveCost).toBe(0);
  });

  it("handles leap-day 2028 ranges", () => {
    const leapHoliday: Holiday = {
      name: "Leap-day event",
      date: "2028-02-29",
      status: "official",
      sourceUrl: "https://example.com",
      verifiedOn: "2028-01-01",
    };
    const plans = buildBreakPlans([leapHoliday], { year: 2028 });
    expect(plans.some((plan) => plan.dates.includes("2028-02-29"))).toBe(true);
  });

  it("deduplicates ranges and ranks by efficiency, length, then leave cost", () => {
    const holiday: Holiday = {
      name: "Friday holiday",
      date: "2027-03-26",
      status: "official",
      sourceUrl: "https://example.com",
      verifiedOn: "2027-01-01",
    };
    const plans = buildBreakPlans([holiday], { year: 2027 });
    const ids = plans.map((plan) => plan.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (let index = 1; index < plans.length; index += 1) {
      const previous = plans[index - 1];
      const current = plans[index];
      expect(previous.efficiency).toBeGreaterThanOrEqual(current.efficiency);
    }
  });

  it("does not let the optional school overlay change recommendations", () => {
    const withoutSchoolOverlay = buildBreakPlans(YEAR_DATA[2027], { schoolOverlay: false });
    const withSchoolOverlay = buildBreakPlans(YEAR_DATA[2027], { schoolOverlay: true });
    expect(withSchoolOverlay).toEqual(withoutSchoolOverlay);
  });

  it("accepts a year directly and exposes 2028 forecast plans", () => {
    const plans = buildBreakPlans(2028);
    expect(plans.length).toBeGreaterThan(0);
    expect(plans.every((plan) => plan.leaveCost <= 4)).toBe(true);
    expect(plans.flatMap((plan) => plan.anchorHolidays).some((holiday) => holiday.status === "forecast")).toBe(
      true,
    );
  });
});

