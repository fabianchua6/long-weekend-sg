"use client";

import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
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
import { ChevronRight, ExternalLinkIcon, SettingsIcon } from "./icons";
import { MonthCard } from "./month-card";
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
  return (
    <label className={`${styles.toggleControl} ${disabled ? styles.toggleDisabled : ""}`}>
      <span className={styles.toggleLabel}>{label}</span>
      <input
        className={styles.srOnly}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-label={description ? `${label}. ${description}` : label}
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
  recommendationLocked,
  onYearChange,
  onSchoolOverlayChange,
  onSaturdayPolicyChange,
}: {
  year: SupportedYear;
  schoolOverlay: boolean;
  saturdayPolicy: boolean;
  recommendationLocked: boolean;
  onYearChange: (year: SupportedYear) => void;
  onSchoolOverlayChange: (checked: boolean) => void;
  onSaturdayPolicyChange: (checked: boolean) => void;
}) {
  const [settingsMounted, setSettingsMounted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const settingsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextYear: SupportedYear = year === 2027 ? 2028 : 2027;

  const clearSettingsTimer = useCallback(() => {
    if (settingsTimer.current) clearTimeout(settingsTimer.current);
    settingsTimer.current = null;
  }, []);

  const openSettings = () => {
    clearSettingsTimer();
    setSettingsMounted(true);
    requestAnimationFrame(() => setSettingsOpen(true));
  };

  const closeSettings = useCallback((restoreFocus = false) => {
    clearSettingsTimer();
    setSettingsOpen(false);
    settingsTimer.current = setTimeout(() => {
      setSettingsMounted(false);
      settingsTimer.current = null;
    }, 150);
    if (restoreFocus) settingsButtonRef.current?.focus();
  }, [clearSettingsTimer]);
  const closeSettingsFromEffect = useEffectEvent((restoreFocus = false) => {
    closeSettings(restoreFocus);
  });

  useEffect(() => {
    if (!settingsMounted) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!settingsRef.current?.contains(event.target as Node)) closeSettingsFromEffect();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSettingsFromEffect(true);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [settingsMounted]);

  useEffect(() => () => clearSettingsTimer(), [clearSettingsTimer]);

  return (
    <>
      <header className={styles.header}>
        <div>
          <div className={styles.titleLine}>
            <h1>Long Weekend SG</h1>
            <span className={`${styles.statusBadge} ${year === 2028 ? styles.forecastBadge : ""}`}>
              {year === 2027 ? "Official" : "Provisional"}
            </span>
          </div>
        </div>

        <div className={styles.controls} aria-label="Planner controls" role="group">
          <button
            className={styles.yearSwitch}
            type="button"
            aria-label={`Show ${nextYear} calendar`}
            onClick={() => onYearChange(nextYear)}
          >
            {year === 2028 ? <ChevronRight className={styles.chevronLeft} /> : null}
            <span>{year}</span>
            {year === 2027 ? <ChevronRight /> : null}
          </button>

          <div className={styles.settingsShell} ref={settingsRef}>
            <button
              ref={settingsButtonRef}
              className={styles.settingsButton}
              type="button"
              disabled={recommendationLocked}
              aria-expanded={settingsOpen}
              aria-controls={settingsMounted ? "planner-settings" : undefined}
              onClick={() => (settingsOpen ? closeSettings() : openSettings())}
            >
              <SettingsIcon />
              <span>Settings</span>
            </button>

            {settingsMounted ? (
              <div
                id="planner-settings"
                className={`${styles.settingsMenu} ${settingsOpen ? styles.settingsMenuOpen : styles.settingsMenuClosing}`}
                aria-label="Planner settings"
                role="group"
              >
                <Toggle
                  checked={schoolOverlay}
                  disabled={year === 2028}
                  label="School breaks"
                  description={
                    year === 2028
                      ? "Unavailable until MOE publishes official 2028 dates."
                      : "Show official MOE school break dates."
                  }
                  onChange={onSchoolOverlayChange}
                />
                <Toggle
                  checked={saturdayPolicy}
                  label="Saturday PH → Monday"
                  description="Use only if your workplace grants Monday off after a Saturday public holiday."
                  onChange={onSaturdayPolicyChange}
                />
              </div>
            ) : null}
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
        <strong>2028 dates are a forecast.</strong> Fixed dates are reliable; lunar and religious
        dates stay provisional until MOM confirms them.
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
      <p>
        Built for Monday–Friday workers. Saturday public holidays may be compensated with another
        day off or salary in lieu; Monday is only added when the workplace switch is on.
      </p>
      <nav aria-label="Sources">
        <a href={MOM_2027_SOURCE} target="_blank" rel="noreferrer">MOM holidays <ExternalLinkIcon /></a>
        <a href={MOM_ENTITLEMENT_SOURCE} target="_blank" rel="noreferrer">Entitlement rules <ExternalLinkIcon /></a>
        <a href={MOE_2027_SOURCE} target="_blank" rel="noreferrer">MOE calendar <ExternalLinkIcon /></a>
      </nav>
    </footer>
  );
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
  const [yearDirection, setYearDirection] = useState<"forward" | "backward" | "idle">("idle");
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressedFocusPreviewDate = useRef<DateString | null>(null);

  const yearData = YEAR_DATA[year];

  const holidayDates = useMemo(
    () => effectiveHolidayDates(yearData.holidays, { saturdayHolidayPolicy: saturdayPolicy }, year),
    [saturdayPolicy, year, yearData.holidays],
  );

  const plans = useMemo(
    () =>
      buildBreakPlans(yearData, { year, saturdayHolidayPolicy: saturdayPolicy }).filter(
        (plan) =>
          plan.leaveCost >= 1 &&
          plan.leaveCost <= 4 &&
          plan.totalDaysOff >= 3 &&
          plan.totalDaysOff >= plan.leaveCost + 2,
      ),
    [saturdayPolicy, year, yearData],
  );

  const planById = useMemo(
    () => new Map(plans.map((plan) => [plan.id, plan] as const)),
    [plans],
  );

  const plansByDate = useMemo(() => {
    const map = new Map<DateString, BreakPlan[]>();
    for (const plan of plans) {
      const interactiveDates = plan.dates.filter(
        (date) => plan.leaveDates.includes(date) || holidayDates.has(date),
      );
      for (const date of interactiveDates) {
        const existing = map.get(date) ?? [];
        if (!existing.some((candidate) => candidate.id === plan.id)) existing.push(plan);
        map.set(date, existing);
      }
    }
    return map;
  }, [holidayDates, plans]);

  const suggestedLeaveDates = useMemo(
    () => new Set(plans.flatMap((plan) => plan.leaveDates)),
    [plans],
  );

  const schoolDates = useMemo(() => {
    const dates = new Set<DateString>();
    if (!schoolOverlay || year !== 2027) return dates;
    for (const schoolBreak of SCHOOL_BREAKS[year]) {
      for (const date of datesInRange(schoolBreak.startDate, schoolBreak.endDate)) dates.add(date);
    }
    return dates;
  }, [schoolOverlay, year]);

  const activePlan = planById.get(hoveredPlanId ?? lockedPlanId ?? "") ?? null;
  const activeRange = useMemo(
    () => new Set(activePlan?.dates ?? []),
    [activePlan],
  );
  const activeLeave = useMemo(
    () => new Set(activePlan?.leaveDates ?? []),
    [activePlan],
  );

  const alternatives = useMemo(() => {
    if (!activePlan || !anchorDate) return [];
    return (plansByDate.get(anchorDate) ?? [])
      .filter((plan) => plan.id !== activePlan.id)
      .filter(
        (plan, index, all) =>
          all.findIndex(
            (candidate) =>
              candidate.leaveCost === plan.leaveCost &&
              candidate.totalDaysOff === plan.totalDaysOff &&
              candidate.startDate === plan.startDate &&
              candidate.endDate === plan.endDate,
          ) === index,
      )
      .slice(0, 2);
  }, [activePlan, anchorDate, plansByDate]);

  const cancelClear = () => {
    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = null;
  };

  const scheduleClear = () => {
    cancelClear();
    if (lockedPlanId) return;
    clearTimer.current = setTimeout(() => setHoveredPlanId(null), 120);
  };

  const previewDate = (date: DateString, source: "focus" | "pointer") => {
    if (source === "focus" && suppressedFocusPreviewDate.current === date) {
      suppressedFocusPreviewDate.current = null;
      return;
    }
    cancelClear();
    const bestPlan = plansByDate.get(date)?.[0];
    if (!bestPlan) return;
    setAnchorDate(date);
    setHoveredPlanId(bestPlan.id);
  };

  const lockDate = (date: DateString) => {
    cancelClear();
    const bestPlan = plansByDate.get(date)?.[0];
    if (!bestPlan) return;
    if (lockedPlanId === bestPlan.id && anchorDate === date) {
      setLockedPlanId(null);
      setHoveredPlanId(null);
      setAnchorDate(null);
      return;
    }
    setAnchorDate(date);
    setHoveredPlanId(null);
    setLockedPlanId(bestPlan.id);
  };

  const closePlan = () => {
    const dateToRestore = anchorDate;
    cancelClear();
    setHoveredPlanId(null);
    setLockedPlanId(null);
    setAnchorDate(null);
    if (dateToRestore) {
      suppressedFocusPreviewDate.current = dateToRestore;
      requestAnimationFrame(() => {
        document.querySelector<HTMLButtonElement>(`button[data-date="${dateToRestore}"]`)?.focus();
      });
    }
  };

  const chooseAlternative = (plan: BreakPlan) => {
    cancelClear();
    setHoveredPlanId(null);
    setLockedPlanId(plan.id);
  };

  const changeYear = (nextYear: SupportedYear) => {
    if (nextYear === year) return;
    const direction = nextYear > year ? "forward" : "backward";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const documentWithTransitions = document as Document & {
      startViewTransition?: (callback: () => void | Promise<void>) => { finished: Promise<void> };
    };
    const canUseViewTransition = !reducedMotion && Boolean(documentWithTransitions.startViewTransition);
    const updateYear = () => {
      setYearDirection(canUseViewTransition ? "idle" : direction);
      setYear(nextYear);
      setSchoolOverlay(false);
      closePlan();
      const url = new URL(window.location.href);
      url.searchParams.set("year", String(nextYear));
      window.history.replaceState({}, "", url);
    };

    if (canUseViewTransition && documentWithTransitions.startViewTransition) {
      document.documentElement.dataset.yearDirection = direction;
      const transition = documentWithTransitions.startViewTransition(() => {
        updateYear();
        return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      });
      transition.finished.finally(() => {
        delete document.documentElement.dataset.yearDirection;
      });
    } else {
      updateYear();
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const dateToRestore = anchorDate;
      if (clearTimer.current) clearTimeout(clearTimer.current);
      clearTimer.current = null;
      setHoveredPlanId(null);
      setLockedPlanId(null);
      setAnchorDate(null);
      if (dateToRestore) {
        suppressedFocusPreviewDate.current = dateToRestore;
        requestAnimationFrame(() => {
          document.querySelector<HTMLButtonElement>(`button[data-date="${dateToRestore}"]`)?.focus();
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [anchorDate]);

  useEffect(
    () => () => {
      if (clearTimer.current) clearTimeout(clearTimer.current);
    },
    [],
  );

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <PlannerHeader
          year={year}
          schoolOverlay={schoolOverlay}
          saturdayPolicy={saturdayPolicy}
          recommendationLocked={Boolean(lockedPlanId)}
          onYearChange={changeYear}
          onSchoolOverlayChange={setSchoolOverlay}
          onSaturdayPolicyChange={(next) => {
            setSaturdayPolicy(next);
            closePlan();
          }}
        />

        <div
          key={year}
          className={`${styles.yearCanvas} ${yearDirection === "forward" ? styles.yearCanvasForward : yearDirection === "backward" ? styles.yearCanvasBackward : ""}`}
        >
          {year === 2028 ? <ForecastNotice /> : null}
          <section className={styles.calendarSection} aria-label={`${year} calendar`}>
            <div className={styles.calendarGrid}>
              {MONTHS.map((month, monthIndex) => (
                <MonthCard
                  key={month}
                  month={month}
                  monthIndex={monthIndex}
                  year={year}
                  yearHolidays={yearData.holidays}
                  holidayDates={holidayDates}
                  plansByDate={plansByDate}
                  activePlan={activePlan}
                  alternatives={alternatives}
                  activeRange={activeRange}
                  activeLeave={activeLeave}
                  suggestedLeaveDates={suggestedLeaveDates}
                  schoolDates={schoolDates}
                  anchorDate={anchorDate}
                  lockedPlanId={lockedPlanId}
                  previewDate={previewDate}
                  lockDate={lockDate}
                  scheduleClear={scheduleClear}
                  cancelClear={cancelClear}
                  closePlan={closePlan}
                  chooseAlternative={chooseAlternative}
                />
              ))}
            </div>
          </section>

          <PlannerLegend year={year} schoolOverlay={schoolOverlay} />
        </div>
        <PlannerFooter />
      </div>

      {activePlan ? <button className={styles.sheetBackdrop} type="button" aria-label="Close recommendation" onClick={closePlan} /> : null}
    </main>
  );
}
