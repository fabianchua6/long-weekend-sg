/** An ISO calendar date. All dates in the planner are date-only values. */
export type DateString = `${number}-${number}-${number}`;

export type DatasetStatus = "official" | "forecast";
export type ForecastConfidence = "high" | "medium" | "low";

export interface Holiday {
  name: string;
  /** The gazetted/estimated date of the holiday, in YYYY-MM-DD form. */
  date: DateString;
  /** An explicit day in lieu published alongside a Sunday holiday. */
  observedDate?: DateString;
  status: DatasetStatus;
  sourceUrl: string;
  verifiedOn: DateString;
  /** Only forecast records need confidence; official records intentionally omit it. */
  forecastConfidence?: ForecastConfidence;
}

export interface SchoolBreak {
  startDate: DateString;
  endDate: DateString;
  label: string;
  sourceUrl: string;
  verifiedOn: DateString;
  status: DatasetStatus;
  kind?: "vacation" | "scheduled-holiday" | "day-in-lieu";
  appliesTo?: "all" | "primary" | "primary-secondary";
}

export interface DateRange {
  start: DateString;
  end: DateString;
}

export interface BreakPlan {
  id: string;
  range: DateRange;
  /** Aliases are retained to keep the domain object convenient for calendar views. */
  startDate: DateString;
  endDate: DateString;
  dates: DateString[];
  anchorHolidays: Holiday[];
  leaveDates: DateString[];
  leaveDays: DateString[];
  leaveCost: number;
  totalDaysOff: number;
  daysOff: number;
  /** Total days off divided by leave cost (zero-leave plans use a denominator of one). */
  efficiency: number;
}

export interface PlannerPreferences {
  year?: number;
  selectedYear?: number;
  /** This is display-only. School dates never alter leave recommendations. */
  schoolOverlay?: boolean;
  includeSchoolHolidays?: boolean;
  /** When enabled, Saturday public holidays add the following Monday as a workplace day off. */
  saturdayHolidayPolicy?: boolean;
  saturdayHolidayObserved?: boolean;
}

export interface YearData {
  year: number;
  status: DatasetStatus;
  holidays: Holiday[];
  schoolBreaks: SchoolBreak[];
}

