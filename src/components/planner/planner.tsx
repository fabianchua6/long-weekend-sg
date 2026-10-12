"use client";

import { useCallback, useEffect, useEffectEvent, useId, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  FORECAST_2028_SOURCE,
  MOM_2027_SOURCE,
  MOM_ENTITLEMENT_SOURCE,
  MOE_2027_SOURCE,
  SCHOOL_BREAKS,
  YEAR_DATA,
} from "@/lib/planner/data";
import {
  buildBreakPlans,
  datesInRange,
  effectiveHolidayDates,
} from "@/lib/planner/build-break-plans";
import type { BreakPlan, DateString } from "@/lib/planner/types";
import { featuredBreakPlans, getPlanOptions, indexPlansByDate, usefulPlans } from "@/lib/planner/recommendations";
import { ChevronRight, ExternalLinkIcon, SettingsIcon } from "./icons";
import { MonthCard } from "./month-card";
import { PlanDetails } from "./plan-details";
import styles from "./planner.module.css";

type SupportedYear = 2027 | 2028;

type PlannerProps = {
  initialYear: SupportedYear;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function Toggle({
  checked,
  disabled,
  label,
  description,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  description?: string;
  onChange: (next: boolean) => void;
}) {
  const descriptionId = useId();
  return (
    <label className={`${styles.toggleControl} ${disabled ? styles.toggleDisabled : ""}`}>
      <span className={styles.toggleLabel}>{label}{description ? <small id={descriptionId}>{description}</small> : null}</span>
      <input
        className={styles.srOnly}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-label={label}
        aria-describedby={description ? descriptionId : undefined}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className={styles.switch} aria-hidden="true">
        <span className={styles.switchKnob} />
      </span>
    </label>
  );
}

function PlannerHeader({
  year,
  schoolOverlay,
  saturdayPolicy,
  onYearChange,
  onSchoolOverlayChange,
  onSaturdayPolicyChange,
}: {
  year: SupportedYear;
  schoolOverlay: boolean;
  saturdayPolicy: boolean;
  onYearChange: (year: SupportedYear) => void;
  onSchoolOverlayChange: (checked: boolean) => void;
  onSaturdayPolicyChange: (checked: boolean) => void;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const nextYear: SupportedYear = year === 2027 ? 2028 : 2027;

  const openSettings = () => {
    setSettingsOpen(true);
  };

  const closeSettings = useCallback((restoreFocus = false) => {
    setSettingsOpen(false);
    if (restoreFocus) settingsButtonRef.current?.focus();
  }, []);
  const closeSettingsFromEffect = useEffectEvent((restoreFocus = false) => {
    closeSettings(restoreFocus);
  });

  useEffect(() => {
    if (!settingsOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!settingsRef.current?.contains(event.target as Node)) closeSettingsFromEffect();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSettingsFromEffect(true);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [settingsOpen]);

  return (
    <>
      <header className={styles.header}>
        <div>
          <div className={styles.titleLine}>
            <h1>Long Weekend SG</h1>

          </div>
        </div>

        <div className={styles.controls} aria-label="Planner controls" role="group">
          <button
            className={styles.yearSwitch}
            type="button"
            aria-label={`${year} calendar. Show ${nextYear}`}
            data-year={year}
            onClick={() => onYearChange(nextYear)}
          >
            <span className={styles.previousYearArrow} aria-hidden="true"><ChevronRight className={styles.chevronLeft} /></span>
            <span className={styles.yearLabel} aria-hidden="true">
              <span className={styles.yearLabelTrack}>
                <span>2027</span><span>2028</span>
              </span>
            </span>
            <span className={styles.nextYearArrow} aria-hidden="true"><ChevronRight /></span>
          </button>

          <span className={`${styles.statusBadge} ${year === 2028 ? styles.forecastBadge : ""}`}>
            {year === 2027 ? "Official" : "Provisional"}
          </span>
          <div className={styles.settingsShell} ref={settingsRef}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) closeSettings();
            }}>
            <button
              ref={settingsButtonRef}
              aria-label="Settings"
              className={styles.settingsButton}
              type="button"
              aria-expanded={settingsOpen}
              aria-controls="planner-settings"
              onClick={() => (settingsOpen ? closeSettings() : openSettings())}
            >
              <SettingsIcon />
              <span>Settings</span>
            </button>

              <div
                id="planner-settings"
                className={`${styles.settingsMenu} ${settingsOpen ? styles.settingsMenuOpen : styles.settingsMenuClosing}`}
                aria-label="Planner settings"
                role="group"
                inert={!settingsOpen}
                aria-hidden={!settingsOpen}
              >
                <Toggle
                  checked={schoolOverlay}
                  disabled={year === 2028}
                  label="School breaks"
                  description={
                    year === 2028
                      ? "Unavailable until MOE publishes official 2028 dates."
                      : undefined
                  }
                  onChange={onSchoolOverlayChange}
                />
                <Toggle
                  checked={saturdayPolicy}
                  label="My workplace gives Monday off for Saturday PH"
                  onChange={onSaturdayPolicyChange}
                />
              </div>
          </div>
        </div>
      </header>
    </>
  );
}

function ForecastNotice() {
  return (
    <aside className={styles.notice} aria-label="2028 forecast notice">
      <div>
        <strong>2028 is provisional.</strong> Confirm MOM dates before booking.
      </div>
      <a href={FORECAST_2028_SOURCE} target="_blank" rel="noreferrer">
        Forecast source <ExternalLinkIcon />
      </a>
    </aside>
  );
}

function PlannerLegend({ year, schoolOverlay }: { year: SupportedYear; schoolOverlay: boolean }) {
  return (
    <section className={styles.legend} aria-label="Calendar legend">
      <span><i className={styles.legendHoliday} />Public holiday</span>
      <span><i className={styles.legendPotential} />Potential break</span>
      <span><i className={styles.legendLeave} />Suggested leave</span>
      <span><i className={styles.legendWeekend} />Weekend</span>
      {schoolOverlay ? <span><i className={styles.legendSchool} />School break</span> : null}
      {year === 2028 ? <span><i className={styles.legendForecast} />Forecast date</span> : null}
    </section>
  );
}

function PlannerFooter() {
  return (
    <footer className={styles.footer}>
      <span>Singapore · Monday–Friday</span>
      <details>
        <summary>Sources &amp; policy</summary>
        <p>Saturday public holidays may be compensated with another day off or salary in lieu. Monday is only added when the workplace switch is on.</p>
        <p>Breaks stay within the selected year. School shading includes school-specific holidays; check the MOE calendar for your school.</p>
        <nav aria-label="Sources">
          <a href={MOM_2027_SOURCE} target="_blank" rel="noreferrer">MOM holidays <ExternalLinkIcon /></a>
          <a href={MOM_ENTITLEMENT_SOURCE} target="_blank" rel="noreferrer">Entitlement rules <ExternalLinkIcon /></a>
          <a href={MOE_2027_SOURCE} target="_blank" rel="noreferrer">MOE calendar <ExternalLinkIcon /></a>
        </nav>
      </details>
    </footer>
  );
}

function useCalendarData(year: SupportedYear, saturdayPolicy: boolean, schoolOverlay: boolean) {
  const yearData = YEAR_DATA[year];

  const holidayDates = useMemo(
    () => effectiveHolidayDates(yearData.holidays, { saturdayHolidayPolicy: saturdayPolicy }, year),
    [saturdayPolicy, year, yearData.holidays],
  );

  const plans = useMemo(
    () =>
      usefulPlans(buildBreakPlans(yearData, { year, saturdayHolidayPolicy: saturdayPolicy }), holidayDates),
    [saturdayPolicy, year, yearData, holidayDates],
  );

  const featured = useMemo(() => featuredBreakPlans(plans), [plans]);
  const potentialByDate = useMemo(() => new Map(featured.flatMap((plan) => plan.dates.map((date) => [date, plan] as const))), [featured]);
  const plansByDate = useMemo(() => indexPlansByDate(plans, holidayDates, featured), [holidayDates, plans, featured]);

  const suggestedLeaveDates = useMemo(
    () => new Set(plans.flatMap((plan) => plan.leaveDates)),
    [plans],
  );

  const schoolDates = useMemo(() => {
    const dates = new Map<DateString, string[]>();
    if (!schoolOverlay || year !== 2027) return dates;
    for (const schoolBreak of SCHOOL_BREAKS[year]) {
      const scope = schoolBreak.appliesTo === "primary" ? " (primary schools)" : schoolBreak.appliesTo === "primary-secondary" ? " (primary and secondary schools)" : "";
      for (const date of datesInRange(schoolBreak.startDate, schoolBreak.endDate)) {
        dates.set(date, [...(dates.get(date) ?? []), schoolBreak.label + scope]);
      }
    }
    return dates;
  }, [schoolOverlay, year]);

  return { year, yearData, holidayDates, plans, plansByDate, potentialByDate, suggestedLeaveDates, schoolDates };
}

export function Planner({ initialYear }: PlannerProps) {
  const searchParams = useSearchParams();
  const [year, setYear] = useState<SupportedYear>(() =>
    searchParams.get("year") === "2028" ? 2028 : initialYear,
  );
  const [schoolOverlay, setSchoolOverlay] = useState(false);
  const [saturdayPolicy, setSaturdayPolicy] = useState(false);
  const [hoveredPlanId, setHoveredPlanId] = useState<string | null>(null);
  const [lockedPlanId, setLockedPlanId] = useState<string | null>(null);
  const [anchorDate, setAnchorDate] = useState<DateString | null>(null);
  const suppressedFocusPreviewDate = useRef<DateString | null>(null);
  // Keep both pages mounted so CSS can reverse an in-flight swipe smoothly.
  const calendar2027 = useCalendarData(2027, saturdayPolicy, schoolOverlay);
  const calendar2028 = useCalendarData(2028, saturdayPolicy, false);
  const { holidayDates, plans, plansByDate } = year === 2027 ? calendar2027 : calendar2028;
  const planById = useMemo(
    () => new Map(plans.map((plan) => [plan.id, plan] as const)),
    [plans],
  );

  const activePlan = planById.get(lockedPlanId ?? hoveredPlanId ?? "") ?? null;
  const activeRange = useMemo(
    () => new Set(activePlan?.dates ?? []),
    [activePlan],
  );
  const activeLeave = useMemo(
    () => new Set(activePlan?.leaveDates ?? []),
    [activePlan],
  );

  const options = useMemo(() => getPlanOptions(anchorDate ? plansByDate.get(anchorDate) ?? [] : []), [anchorDate, plansByDate]);

  const previewDate = (date: DateString, source: "focus" | "pointer") => {
    if (source === "focus" && suppressedFocusPreviewDate.current === date) {
      suppressedFocusPreviewDate.current = null;
      return;
    }
    if (lockedPlanId) return;
    const bestPlan = getPlanOptions(plansByDate.get(date) ?? [])[0];
    if (!bestPlan) return;
    setAnchorDate(date);
    setHoveredPlanId(bestPlan.id);
  };

  const lockDate = (date: DateString, focusDetails = false) => {
    const bestPlan = getPlanOptions(plansByDate.get(date) ?? [])[0];
    if (!bestPlan) return;
    if (lockedPlanId && anchorDate === date) {
      setLockedPlanId(null);
      setHoveredPlanId(null);
      setAnchorDate(null);
      return;
    }
    setAnchorDate(date);
    setHoveredPlanId(null);
    setLockedPlanId(bestPlan.id);
    if (focusDetails) requestAnimationFrame(() => document.getElementById("break-title")?.focus({ preventScroll: true }));
  };

  const closePlan = (restoreFocus = true) => {
    const dateToRestore = anchorDate;
    setHoveredPlanId(null);
    setLockedPlanId(null);
    setAnchorDate(null);
    if (restoreFocus && dateToRestore) {
      suppressedFocusPreviewDate.current = dateToRestore;
      requestAnimationFrame(() => {
        document.querySelector<HTMLButtonElement>(`button[data-date="${dateToRestore}"]`)?.focus({ preventScroll: true });
      });
    }
  };

  const chooseAlternative = (plan: BreakPlan) => {
    setHoveredPlanId(null);
    setLockedPlanId(plan.id);
  };

  const changeYear = (nextYear: SupportedYear) => {
    if (nextYear === year) return;
    suppressedFocusPreviewDate.current = null;
    setHoveredPlanId(null);
    setLockedPlanId(null);
    setAnchorDate(null);
    setSchoolOverlay(false);
    setYear(nextYear);
    const url = new URL(window.location.href);
    url.searchParams.set("year", String(nextYear));
    window.history.replaceState({}, "", url);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented || document.querySelector("dialog[open], [aria-label='Settings'][aria-expanded='true']")) return;
      const dateToRestore = anchorDate;
      setHoveredPlanId(null);
      setLockedPlanId(null);
      setAnchorDate(null);
      if (dateToRestore) {
        suppressedFocusPreviewDate.current = dateToRestore;
        requestAnimationFrame(() => {
          document.querySelector<HTMLButtonElement>(`button[data-date="${dateToRestore}"]`)?.focus({ preventScroll: true });
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [anchorDate]);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <PlannerHeader
          year={year}
          schoolOverlay={schoolOverlay}
          saturdayPolicy={saturdayPolicy}
          onYearChange={changeYear}
          onSchoolOverlayChange={setSchoolOverlay}
          onSaturdayPolicyChange={(next) => {
            setSaturdayPolicy(next);
            closePlan(false);
          }}
        />

        <div className={styles.workspace}>
          <div className={`t-page-slide ${styles.yearSlider}`} data-page={year === 2027 ? "1" : "2"}>
            {[calendar2027, calendar2028].map((calendar) => (
              <div
                key={calendar.year}
                className={`t-page ${styles.yearCanvas}`}
                data-page-id={calendar.year === 2027 ? "1" : "2"}
                inert={calendar.year !== year}
                aria-hidden={calendar.year !== year}
              >
                {calendar.year === 2028 ? <ForecastNotice /> : null}
                <PlannerLegend year={calendar.year} schoolOverlay={calendar.year === 2027 && schoolOverlay} />
                <section className={styles.calendarSection} aria-label={`${calendar.year} calendar`}>
                  <div className={styles.calendarGrid}>
                    {MONTHS.map((month, monthIndex) => (
                      <MonthCard
                        key={month}
                        month={month}
                        monthIndex={monthIndex}
                        year={calendar.year}
                        yearHolidays={calendar.yearData.holidays}
                        holidayDates={calendar.holidayDates}
                        plansByDate={calendar.plansByDate}
                        potentialByDate={calendar.potentialByDate}
                        activePlan={calendar.year === year ? activePlan : null}
                        activeRange={activeRange}
                        activeLeave={activeLeave}
                        suggestedLeaveDates={calendar.suggestedLeaveDates}
                        schoolDates={calendar.schoolDates}
                        lockedPlanId={lockedPlanId}
                        anchorDate={anchorDate}
                        previewDate={previewDate}
                        lockDate={lockDate}
                      />
                    ))}
                  </div>
                </section>
                <PlannerFooter />
              </div>
            ))}
          </div>
          <PlanDetails
            plan={activePlan}
            options={options}
            holidayDates={holidayDates}
            locked={Boolean(lockedPlanId)}
            year={year}
            closePlan={closePlan}
            chooseAlternative={chooseAlternative}
          />
        </div>
      </div>
    </main>
  );
}
