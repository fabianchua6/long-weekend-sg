"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { BreakPlan, DateString, Holiday } from "@/lib/planner/types";
import { CloseIcon, ChevronRight } from "./icons";
import styles from "./planner.module.css";

const dateFormat = new Intl.DateTimeFormat("en-SG", { day: "numeric", month: "short", timeZone: "UTC" });
const leaveFormat = new Intl.DateTimeFormat("en-SG", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const monthFormat = new Intl.DateTimeFormat("en-SG", { month: "long", timeZone: "UTC" });
const weekdayFormat = new Intl.DateTimeFormat("en-SG", { weekday: "short", timeZone: "UTC" });
const asDate = (date: DateString) => new Date(date + "T00:00:00Z");
const formatRange = (plan: BreakPlan) => dateFormat.formatRange(asDate(plan.startDate), asDate(plan.endDate));
const mobileQuery = "(max-width: 760px)";
const subscribeMobile = (notify: () => void) => {
  const media = window.matchMedia(mobileQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
const getMobile = () => window.matchMedia(mobileQuery).matches;
const getServerMobile = () => false;

type Props = {
  plan: BreakPlan | null;
  alternatives: BreakPlan[];
  holidayDates: Map<DateString, Holiday[]>;
  locked: boolean;
  year: number;
  cancelClear: () => void;
  scheduleClear: () => void;
  closePlan: () => void;
  chooseAlternative: (plan: BreakPlan) => void;
};

function DetailsContent({ plan, alternatives, holidayDates, locked, year, closePlan, chooseAlternative }: Props) {
  if (!plan) return <p className={styles.emptyPanel}>No breaks available for these settings.</p>;
  const holidays = plan.dates.flatMap((date) => (holidayDates.get(date) ?? []).map((holiday) => ({ date, holiday })));
  const leaveDates = new Set(plan.leaveDates);
  return (
    <>
      {locked ? <button className={styles.closeButton} type="button" onClick={closePlan} aria-label="Close recommendation"><CloseIcon /></button> : null}
      <h2 id="break-title" className={styles.panelTitle}>{monthFormat.format(asDate(plan.startDate))} break</h2>
      <div className={styles.planHeadline}>{plan.totalDaysOff} days off</div>
      <div className={styles.planCost}>{plan.leaveCost} leave {plan.leaveCost === 1 ? "day" : "days"}</div>
      <p className={styles.planRange}>{formatRange(plan)} {year}</p>
      {year === 2028 ? <p className={styles.panelForecast}>Provisional dates</p> : null}
      <section className={styles.detailSection} aria-label="Leave dates">
        <h3>Take leave</h3>
        <ul className={styles.leaveList}>{plan.leaveDates.map((date) => <li key={date}><time dateTime={date}>{leaveFormat.format(asDate(date))}</time></li>)}</ul>
      </section>
      <section className={styles.detailSection} aria-label="Public holidays in this break">
        <h3>Public holidays</h3>
        <ul className={styles.holidayList}>
          {holidays.map(({ date, holiday }) => (
            <li key={date + holiday.name}>
              <time dateTime={date}>{dateFormat.format(asDate(date))}</time>
              <div><a href={holiday.sourceUrl} target="_blank" rel="noreferrer">{holiday.name}</a>
                {date !== holiday.date ? <small>{date === holiday.observedDate || asDate(holiday.date).getUTCDay() === 0 ? "Observed holiday" : "Workplace Monday-off assumption"}</small> : null}
                {holiday.status === "forecast" ? <small>{holiday.forecastConfidence}-confidence forecast</small> : null}
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className={`${styles.detailSection} ${styles.timelineSection}`} aria-label="Break at a glance">
        <h3>Break at a glance</h3>
        <ol className={styles.breakTimeline}>
          {plan.dates.map((date) => {
            const leave = leaveDates.has(date);
            const holiday = holidayDates.has(date);
            return <li key={date} className={leave ? styles.timelineLeave : holiday ? styles.timelineHoliday : ""}
              aria-label={`${leaveFormat.format(asDate(date))}, ${leave ? "take leave" : holiday ? "public holiday" : "weekend"}`}>
              <span>{asDate(date).getUTCDate()}</span><small>{weekdayFormat.format(asDate(date))}</small>
            </li>;
          })}
        </ol>
      </section>
      {alternatives.length ? <section className={`${styles.detailSection} ${styles.alternatives}`} aria-label="Alternative breaks">
        <h3>Other options</h3>
        {alternatives.map((alternative) => <button type="button" key={alternative.id} onClick={() => chooseAlternative(alternative)}>
          <span><strong>{alternative.leaveCost} {alternative.leaveCost === 1 ? "day" : "days"} leave → {alternative.totalDaysOff} days off</strong><small>{formatRange(alternative)}</small></span><ChevronRight />
        </button>)}
      </section> : null}
    </>
  );
}

export function PlanDetails(props: Props) {
  const mobile = useSyncExternalStore(subscribeMobile, getMobile, getServerMobile);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const modalOpen = mobile && props.locked;
  const closeSheet = () => {
    dialogRef.current?.close();
    props.closePlan();
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!modalOpen || !dialog) return;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [modalOpen]);

  const announcement = props.plan
    ? `${formatRange(props.plan)}: ${props.plan.leaveCost} leave days for ${props.plan.totalDaysOff} days off.`
    : "";

  if (mobile) return (
    <dialog ref={dialogRef} className={styles.mobileSheet} aria-labelledby="break-title"
      onCancel={(event) => { event.preventDefault(); closeSheet(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeSheet();
      }}>
      <div className={styles.sheetHandle} aria-hidden="true" />
      <DetailsContent {...props} closePlan={closeSheet} />
    </dialog>
  );
  return (
    <aside className={styles.detailsPanel} aria-label="Break details" onPointerEnter={props.cancelClear} onPointerLeave={props.scheduleClear}
      onFocusCapture={props.cancelClear} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) props.scheduleClear(); }}>
      <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
      <DetailsContent {...props} />
    </aside>
  );
}
