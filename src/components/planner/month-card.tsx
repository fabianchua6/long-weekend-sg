"use client";

import { dateKey } from "@/lib/planner/build-break-plans";
import { getPlanOptions, rangeEdges } from "@/lib/planner/recommendations";
import type { BreakPlan, DateString, Holiday } from "@/lib/planner/types";
import styles from "./planner.module.css";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"] as const;

const fullDate = new Intl.DateTimeFormat("en-SG", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function toDate(value: DateString): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function plural(value: number, singular: string): string {
  return `${value} ${singular}${value === 1 ? "" : "s"}`;
}

function confidenceLabel(holiday: Holiday): string {
  return holiday.forecastConfidence
    ? `${holiday.forecastConfidence}-confidence forecast`
    : "official";
}

type MonthCardProps = {
  month: string;
  monthIndex: number;
  year: number;
  yearHolidays: Holiday[];
  holidayDates: Map<DateString, Holiday[]>;
  plansByDate: Map<DateString, BreakPlan[]>;
  potentialByDate: Map<DateString, BreakPlan>;
  activePlan: BreakPlan | null;
  activeRange: Set<DateString>;
  activeLeave: Set<DateString>;
  suggestedLeaveDates: Set<DateString>;
  schoolDates: Map<DateString, string[]>;
  lockedPlanId: string | null;
  anchorDate: DateString | null;
  previewDate: (date: DateString, source: "focus" | "pointer") => void;
  lockDate: (date: DateString, focusDetails?: boolean) => void;
};

type DayCellProps = Pick<
  MonthCardProps,
  | "monthIndex"
  | "year"
  | "yearHolidays"
  | "holidayDates"
  | "plansByDate"
  | "potentialByDate"
  | "activePlan"
  | "activeRange"
  | "activeLeave"
  | "suggestedLeaveDates"
  | "schoolDates"
  | "lockedPlanId"
  | "anchorDate"
  | "previewDate"
  | "lockDate"
> & {
  day: number | null;
};

function buildDayDetails({
  day,
  monthIndex,
  year,
  yearHolidays,
  holidayDates,
  plansByDate,
  potentialByDate,
  activePlan,
  activeRange,
  activeLeave,
  suggestedLeaveDates,
  schoolDates,
  anchorDate,
  lockedPlanId,
}: Omit<DayCellProps, "previewDate" | "lockDate"> & {
  day: number;
}) {
  const date = dateKey(new Date(Date.UTC(year, monthIndex, day)));
  const nativeDay = new Date(Date.UTC(year, monthIndex, day)).getUTCDay();
  const holidays = holidayDates.get(date) ?? [];
  const actualHoliday = yearHolidays.find((holiday) => holiday.date === date);
  const observedHoliday = holidays.find((holiday) => holiday.observedDate === date);
  const derivedHoliday = holidays.find(
    (holiday) => holiday.date !== date && holiday.observedDate !== date,
  );
  const automaticSundayObserved =
    derivedHoliday && toDate(derivedHoliday.date).getUTCDay() === 0 ? derivedHoliday : undefined;
  const workplaceMonday =
    derivedHoliday && toDate(derivedHoliday.date).getUTCDay() === 6 ? derivedHoliday : undefined;
  const datePlans = plansByDate.get(date) ?? [];
  const interactive = datePlans.length > 0;
  const isWeekend = nativeDay === 0 || nativeDay === 6;
  const isHoliday = Boolean(actualHoliday);
  const isObserved = Boolean(
    (observedHoliday || automaticSundayObserved || workplaceMonday) && !actualHoliday,
  );
  const isForecast = holidays.some((holiday) => holiday.status === "forecast");
  const labels = [fullDate.format(toDate(date))];
  if (actualHoliday) labels.push(`${actualHoliday.name}, ${confidenceLabel(actualHoliday)}`);
  if (isObserved && observedHoliday) labels.push(`${observedHoliday.name} observed day`);
  if (isObserved && automaticSundayObserved) labels.push(`${automaticSundayObserved.name} observed day`);
  if (isObserved && workplaceMonday) {
    labels.push(`${workplaceMonday.name}, workplace Monday-off assumption`);
  }
  if (suggestedLeaveDates.has(date)) labels.push("suggested leave day");
  if (schoolDates.has(date)) labels.push(...schoolDates.get(date)!);
  if (potentialByDate.has(date)) labels.push("potential break");
  if (interactive) {
    const selected = Boolean(lockedPlanId && anchorDate === date && activePlan);
    const best = selected ? activePlan! : getPlanOptions(datePlans)[0];
    labels.push(
      `${plural(best.leaveCost, "leave day")} gives ${plural(best.totalDaysOff, "day")} off`,
    );
    if (selected) labels.push("Selected. Activate to clear");
  }

  const dayClasses = [
    styles.day,
    isWeekend ? styles.weekend : "",
    schoolDates.has(date) ? styles.schoolDay : "",
    suggestedLeaveDates.has(date) && !isHoliday && !isObserved ? styles.suggestedDay : "",
    activeRange.has(date) ? styles.rangeDay : "",
    activeLeave.has(date) ? styles.activeLeaveDay : "",
    isHoliday ? styles.holidayDay : "",
    isObserved ? styles.observedDay : "",
    isForecast && (isHoliday || isObserved) ? styles.forecastHoliday : "",
  ]
    .filter(Boolean)
    .join(" ");

  return { date, dayClasses, interactive, label: labels.join(". ") };
}

function DayCell(props: DayCellProps) {
  if (!props.day) return <span className={styles.emptyDay} />;
  const { date, dayClasses, interactive, label } = buildDayDetails({ ...props, day: props.day });
  const band = props.activePlan
    ? (props.activeRange.has(date) ? props.activePlan : undefined)
    : props.potentialByDate.get(date);
  const edges = band ? rangeEdges(date, band) : undefined;

  return (
    <span className={styles.daySlot}
      data-range={band ? (props.activePlan ? "selected" : "potential") : undefined}
      data-range-id={band?.id}
      data-range-forecast={band?.anchorHolidays.some((holiday) => holiday.status === "forecast") || undefined}
      data-range-start={edges?.start || undefined}
      data-range-continues-before={edges?.continuesBefore || undefined}
      data-range-continues-after={edges?.continuesAfter || undefined}
      data-range-end={edges?.end || undefined}>
      {interactive ? (
        <button
          className={dayClasses}
          type="button"
          aria-label={label}
          aria-pressed={Boolean(props.lockedPlanId && props.anchorDate === date)}
          aria-controls="break-details"
          title={label}
          data-date={date}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") props.previewDate(date, "pointer");
          }}
          onFocus={() => props.previewDate(date, "focus")}
          onClick={(event) => props.lockDate(date, event.detail === 0)}
        >
          {props.day}
        </button>
      ) : (
        <span className={dayClasses} title={label}>
          <span aria-hidden="true">{props.day}</span>
          <span className={styles.srOnly}>{label}</span>
        </span>
      )}
    </span>
  );
}

export function MonthCard({
  month,
  monthIndex,
  year,
  yearHolidays,
  holidayDates,
  plansByDate,
  potentialByDate,
  activePlan,
  activeRange,
  activeLeave,
  suggestedLeaveDates,
  schoolDates,
  lockedPlanId,
  anchorDate,
  previewDate,
  lockDate,
}: MonthCardProps) {
  const firstDay = new Date(Date.UTC(year, monthIndex, 1));
  const offset = (firstDay.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const slots = Array.from({ length: 42 }, (_, slotIndex) => {
    const day = slotIndex - offset + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });
  const monthIsActive = activePlan?.dates.some(
    (date) => Number(date.slice(5, 7)) === monthIndex + 1,
  );

  return (
    <article
      className={`${styles.monthCard} ${monthIsActive ? styles.monthCardActive : ""}`}
      aria-label={`${month} ${year}`}
    >
      <div className={styles.monthHeader}>
        <h2>{month}</h2>
      </div>
      <div className={styles.weekdays} aria-hidden="true">
        {WEEKDAYS.map((weekday, index) => (
          <span key={`${weekday}-${index}`}>{weekday}</span>
        ))}
      </div>
      <div className={styles.days}>
        {slots.map((day, slotIndex) => (
          <DayCell
            key={`${monthIndex}-${slotIndex}`}
            day={day}
            monthIndex={monthIndex}
            year={year}
            yearHolidays={yearHolidays}
            holidayDates={holidayDates}
            plansByDate={plansByDate}
            potentialByDate={potentialByDate}
            activePlan={activePlan}
            activeRange={activeRange}
            activeLeave={activeLeave}
            suggestedLeaveDates={suggestedLeaveDates}
            schoolDates={schoolDates}
            lockedPlanId={lockedPlanId}
            anchorDate={anchorDate}
            previewDate={previewDate}
            lockDate={lockDate}
          />
        ))}
      </div>

    </article>
  );
}
