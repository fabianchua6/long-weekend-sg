import type { Holiday, SchoolBreak, YearData } from "./types";

export const MOM_2027_SOURCE =
  "https://www.mom.gov.sg/newsroom/press-releases/2026/0618-public-holidays-for-2027";
export const MOM_ENTITLEMENT_SOURCE =
  "https://www.mom.gov.sg/employment-practices/public-holidays-entitlement-and-pay";
export const MOE_2027_SOURCE =
  "https://www.moe.gov.sg/news/press-releases/20260714-school-terms-and-holidays-for-2027";
export const FORECAST_2028_SOURCE =
  "https://www.singaporeholiday.com.sg/public-holidays/year-2028/";

const official2027 = (name: string, date: `${number}-${number}-${number}`, observedDate?: `${number}-${number}-${number}`): Holiday => ({
  name,
  date,
  ...(observedDate ? { observedDate } : {}),
  status: "official",
  sourceUrl: MOM_2027_SOURCE,
  verifiedOn: "2026-06-18",
});

/** MOM's complete list of 11 gazetted public-holiday days for 2027. */
export const HOLIDAYS_2027: Holiday[] = [
  official2027("New Year's Day", "2027-01-01"),
  official2027("Chinese New Year", "2027-02-06"),
  official2027("Chinese New Year (second day)", "2027-02-07", "2027-02-08"),
  official2027("Hari Raya Puasa", "2027-03-10"),
  official2027("Good Friday", "2027-03-26"),
  official2027("Labour Day", "2027-05-01"),
  official2027("Hari Raya Haji", "2027-05-17"),
  official2027("Vesak Day", "2027-05-20"),
  official2027("National Day", "2027-08-09"),
  official2027("Deepavali", "2027-10-28"),
  official2027("Christmas Day", "2027-12-25"),
];

const school2027 = (
  label: string,
  startDate: `${number}-${number}-${number}`,
  endDate: `${number}-${number}-${number}` = startDate,
  kind: SchoolBreak["kind"] = "scheduled-holiday",
  appliesTo: SchoolBreak["appliesTo"] = "all",
): SchoolBreak => ({
  label,
  startDate,
  endDate,
  sourceUrl: MOE_2027_SOURCE,
  verifiedOn: "2026-07-14",
  status: "official",
  kind,
  appliesTo,
});

/** MOE primary/secondary vacation periods and scheduled school-closure days for 2027. */
export const SCHOOL_BREAKS_2027: SchoolBreak[] = [
  school2027("Term 1 school holidays", "2027-03-13", "2027-03-21", "vacation", "primary-secondary"),
  school2027("Term 2 school holidays", "2027-05-29", "2027-06-27", "vacation", "primary-secondary"),
  school2027("Term 3 school holidays", "2027-09-04", "2027-09-12", "vacation", "primary-secondary"),
  school2027("Term 4 school holidays", "2027-11-20", "2027-12-31", "vacation", "primary-secondary"),
  school2027("School holiday for Youth Day", "2027-07-05"),
  school2027("School holiday for National Day", "2027-08-10"),
  school2027("Teachers' Day", "2027-09-03"),
  school2027("Children's Day", "2027-10-08", "2027-10-08", "scheduled-holiday", "primary"),
  school2027("School day off-in-lieu for Chinese New Year", "2027-02-09", "2027-02-09", "day-in-lieu"),
  school2027("School day off-in-lieu for Labour Day", "2027-05-03", "2027-05-03", "day-in-lieu"),
  school2027("School day off-in-lieu for Christmas Day", "2027-12-27", "2027-12-27", "day-in-lieu"),
];

const forecast2028 = (
  name: string,
  date: `${number}-${number}-${number}`,
  forecastConfidence: Holiday["forecastConfidence"],
  observedDate?: `${number}-${number}-${number}`,
): Holiday => ({
  name,
  date,
  ...(observedDate ? { observedDate } : {}),
  status: "forecast",
  sourceUrl: FORECAST_2028_SOURCE,
  verifiedOn: "2026-09-28",
  forecastConfidence,
});

/**
 * A clearly provisional 2028 planning set. MOM had not gazetted 2028 dates at
 * the time of verification; fixed-date holidays are high confidence while
 * religious/lunar dates remain estimates and are never labelled official.
 */
export const HOLIDAYS_2028: Holiday[] = [
  forecast2028("New Year's Day", "2028-01-01", "high"),
  forecast2028("Chinese New Year", "2028-01-26", "medium"),
  forecast2028("Chinese New Year (second day)", "2028-01-27", "medium"),
  forecast2028("Hari Raya Puasa", "2028-02-27", "low", "2028-02-28"),
  forecast2028("Good Friday", "2028-04-14", "medium"),
  forecast2028("Labour Day", "2028-05-01", "high"),
  forecast2028("Hari Raya Haji", "2028-05-05", "low"),
  forecast2028("Vesak Day", "2028-05-09", "medium"),
  forecast2028("National Day", "2028-08-09", "high"),
  forecast2028("Deepavali", "2028-10-17", "medium"),
  forecast2028("Christmas Day", "2028-12-25", "high"),
];

export const SCHOOL_BREAKS_2028: SchoolBreak[] = [];

/** Supported planner years. The first is official; the second is provisional. */
export const YEARS = [2027, 2028] as const;

export const HOLIDAYS: Record<number, Holiday[]> = {
  2027: HOLIDAYS_2027,
  2028: HOLIDAYS_2028,
};

export const SCHOOL_BREAKS: Record<number, SchoolBreak[]> = {
  2027: SCHOOL_BREAKS_2027,
  2028: SCHOOL_BREAKS_2028,
};

export const YEAR_DATA: Record<number, YearData> = {
  2027: { year: 2027, status: "official", holidays: HOLIDAYS_2027, schoolBreaks: SCHOOL_BREAKS_2027 },
  2028: { year: 2028, status: "forecast", holidays: HOLIDAYS_2028, schoolBreaks: SCHOOL_BREAKS_2028 },
};
