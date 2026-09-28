"use client";

import { useEffect, useRef } from "react";
import { dateKey } from "@/lib/planner/build-break-plans";
import type { BreakPlan, DateString, Holiday } from "@/lib/planner/types";
import { ChevronRight, CloseIcon } from "./icons";
import styles from "./planner.module.css";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"] as const;

const longDate = new Intl.DateTimeFormat("en-SG", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

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

function formatRange(plan: BreakPlan): string {
  const start = longDate.format(toDate(plan.startDate));
  const end = longDate.format(toDate(plan.endDate));
  return start === end ? start : `${start} – ${end}`;
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
  activePlan: BreakPlan | null;
  alternatives: BreakPlan[];
  activeRange: Set<DateString>;
  activeLeave: Set<DateString>;
  suggestedLeaveDates: Set<DateString>;
  schoolDates: Set<DateString>;
  anchorDate: DateString | null;
  lockedPlanId: string | null;
  previewDate: (date: DateString, source: "focus" | "pointer") => void;
  lockDate: (date: DateString) => void;
  scheduleClear: () => void;
  cancelClear: () => void;
  closePlan: () => void;
  chooseAlternative: (plan: BreakPlan) => void;
};

type DayCellProps = Pick<
  MonthCardProps,
  | "monthIndex"
  | "year"
  | "yearHolidays"
  | "holidayDates"
  | "plansByDate"
  | "activePlan"
  | "activeRange"
  | "activeLeave"
  | "suggestedLeaveDates"
  | "schoolDates"
  | "lockedPlanId"
  | "previewDate"
  | "lockDate"
  | "scheduleClear"
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
  activePlan,
  activeRange,
  activeLeave,
  suggestedLeaveDates,
  schoolDates,
}: Omit<DayCellProps, "lockedPlanId" | "previewDate" | "lockDate" | "scheduleClear"> & {
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
  if (schoolDates.has(date)) labels.push("school break");
  if (interactive) {
    const best = datePlans[0];
    labels.push(
      `${plural(best.leaveCost, "leave day")} gives ${plural(best.totalDaysOff, "day")} off`,
    );
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
    date === activePlan?.startDate ? styles.rangeStart : "",
    date === activePlan?.endDate ? styles.rangeEnd : "",
  ]
    .filter(Boolean)
    .join(" ");

  return { date, dayClasses, interactive, label: labels.join(". ") };
}

function DayCell(props: DayCellProps) {
  if (!props.day) return <span className={styles.emptyDay} />;
  const { date, dayClasses, interactive, label } = buildDayDetails({ ...props, day: props.day });

  return (
    <span className={styles.daySlot}>
      {interactive ? (
        <button
          className={dayClasses}
          type="button"
          aria-label={label}
          aria-pressed={props.lockedPlanId ? props.activeRange.has(date) : undefined}
          data-date={date}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") props.previewDate(date, "pointer");
          }}
          onPointerDown={(event) => {
            if (event.button === 0) props.lockDate(date);
          }}
          onPointerLeave={props.scheduleClear}
          onFocus={() => props.previewDate(date, "focus")}
          onBlur={props.scheduleClear}
          onClick={(event) => {
            if (event.detail === 0) props.lockDate(date);
          }}
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

function PlanSummary({ plan }: { plan: BreakPlan }) {
  return (
    <>
      <span>Take {plural(plan.leaveCost, "leave day")}</span>
      <ChevronRight />
      <strong>{plural(plan.totalDaysOff, "day")} off</strong>
    </>
  );
}

function PlanPopover({
  year,
  monthIndex,
  plan,
  alternatives,
  lockedPlanId,
  cancelClear,
  scheduleClear,
  closePlan,
  chooseAlternative,
}: {
  year: number;
  monthIndex: number;
  plan: BreakPlan;
  alternatives: BreakPlan[];
  lockedPlanId: string | null;
  cancelClear: () => void;
  scheduleClear: () => void;
  closePlan: () => void;
  chooseAlternative: (plan: BreakPlan) => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (lockedPlanId) closeButtonRef.current?.focus();
  }, [lockedPlanId]);

  const containDialogFocus = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !lockedPlanId || !dialogRef.current) return;
    const focusable = [
      ...dialogRef.current.querySelectorAll<HTMLElement>(
        "button, [href], [tabindex]:not([tabindex='-1'])",
      ),
    ].filter((element) => !element.hasAttribute("disabled"));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      ref={dialogRef}
      className={styles.planPopover}
      role={lockedPlanId ? "dialog" : "status"}
      aria-modal={lockedPlanId ? "true" : undefined}
      aria-labelledby={lockedPlanId ? `plan-title-${year}-${monthIndex}` : undefined}
      aria-live={lockedPlanId ? undefined : "polite"}
      onKeyDown={containDialogFocus}
      onPointerEnter={cancelClear}
      onPointerLeave={scheduleClear}
      onFocus={cancelClear}
    >
      <button
        ref={closeButtonRef}
        className={styles.closeButton}
        type="button"
        onClick={closePlan}
        aria-label="Close recommendation"
      >
        <CloseIcon />
      </button>
      <div className={styles.planKicker}>Best option</div>
      <div className={styles.planHeadline} id={`plan-title-${year}-${monthIndex}`}>
        <PlanSummary plan={plan} />
      </div>
      <div className={styles.planRange}>{formatRange(plan)}</div>
      <div className={styles.planLeaveDates}>
        Take {plan.leaveDates.map((date) => longDate.format(toDate(date))).join(", ")}
      </div>
      {alternatives.length ? (
        <div className={styles.alternatives}>
          <span>Other options</span>
          {alternatives.map((alternative) => (
            <button
              key={alternative.id}
              type="button"
              onClick={() => chooseAlternative(alternative)}
            >
              <span>{formatRange(alternative)}</span>
              <span className={styles.alternativeTradeoff}>
                {alternative.leaveCost} → {alternative.totalDaysOff}
              </span>
            </button>
          ))}
        </div>
      ) : null}
      {!lockedPlanId ? <div className={styles.lockHint}>Tap to keep this open</div> : null}
    </div>
  );
}

export function MonthCard({
  month,
  monthIndex,
  year,
  yearHolidays,
  holidayDates,
  plansByDate,
  activePlan,
  alternatives,
  activeRange,
  activeLeave,
  suggestedLeaveDates,
  schoolDates,
  anchorDate,
  lockedPlanId,
  previewDate,
  lockDate,
  scheduleClear,
  cancelClear,
  closePlan,
  chooseAlternative,
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
  const popoverMonth = anchorDate ? Number(anchorDate.slice(5, 7)) - 1 : null;
  const showPopover = Boolean(activePlan && popoverMonth === monthIndex);

  return (
    <article
      className={`${styles.monthCard} ${monthIsActive ? styles.monthCardActive : ""}`}
      aria-label={`${month} ${year}`}
    >
      <div className={styles.monthHeader}>
        <h2>{month}</h2>
        <span>{String(monthIndex + 1).padStart(2, "0")}</span>
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
            activePlan={activePlan}
            activeRange={activeRange}
            activeLeave={activeLeave}
            suggestedLeaveDates={suggestedLeaveDates}
            schoolDates={schoolDates}
            lockedPlanId={lockedPlanId}
            previewDate={previewDate}
            lockDate={lockDate}
            scheduleClear={scheduleClear}
          />
        ))}
      </div>

      {showPopover && activePlan ? (
        <PlanPopover
          year={year}
          monthIndex={monthIndex}
          plan={activePlan}
          alternatives={alternatives}
          lockedPlanId={lockedPlanId}
          cancelClear={cancelClear}
          scheduleClear={scheduleClear}
          closePlan={closePlan}
          chooseAlternative={chooseAlternative}
        />
      ) : null}
    </article>
  );
}
