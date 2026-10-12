"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { BreakPlan, DateString, Holiday } from "@/lib/planner/types";
import { CloseIcon } from "./icons";
import styles from "./planner.module.css";

const dateFormat = new Intl.DateTimeFormat("en-SG", { day: "numeric", month: "short", timeZone: "UTC" });
const leaveFormat = new Intl.DateTimeFormat("en-SG", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const monthFormat = new Intl.DateTimeFormat("en-SG", { month: "long", timeZone: "UTC" });
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
  options: BreakPlan[];
  holidayDates: Map<DateString, Holiday[]>;
  locked: boolean;
  year: number;
  closePlan: () => void;
  chooseAlternative: (plan: BreakPlan) => void;
};

function DetailsContent({ plan, options, holidayDates, year, closePlan, chooseAlternative }: Props) {
  if (!plan) return <div className={styles.emptyPanel}><h2 className={styles.panelTitle}>Pick a date</h2><p>Select a public holiday or a blue-marked leave day.</p></div>;
  const holidays = plan.dates.flatMap((date) => (holidayDates.get(date) ?? []).map((holiday) => ({ date, holiday })));
  return (
    <>
      <button className={styles.closeButton} type="button" onClick={closePlan} aria-label="Clear selection"><CloseIcon /></button>
      <h2 id="break-title" tabIndex={-1} className={styles.panelTitle}>{monthFormat.formatRange(asDate(plan.startDate), asDate(plan.endDate))} break</h2>
      <div className={styles.planHeadline}>{plan.totalDaysOff} days off</div>
      <div className={styles.planCost}>{plan.leaveCost ? `Take ${plan.leaveCost} leave ${plan.leaveCost === 1 ? "day" : "days"}` : "No leave needed"}</div>
      <p className={styles.planRange}>{formatRange(plan)} {year}</p>
      {year === 2028 ? <p className={styles.panelForecast}>Provisional dates</p> : null}
      {plan.leaveCost > 0 ? <section className={styles.detailSection} aria-label="Leave dates">
        <h3>Take leave</h3>
        <ul className={styles.leaveList}>{plan.leaveDates.map((date) => <li key={date}><time dateTime={date}>{leaveFormat.format(asDate(date))}</time></li>)}</ul>
      </section> : null}
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
      {options.length > 1 ? <section className={`${styles.detailSection} ${styles.alternatives}`} aria-label="Compare breaks">
        <h3>Compare breaks</h3>
        {options.map((alternative) => <button type="button" key={alternative.id}
          aria-pressed={alternative.id === plan.id} onClick={() => chooseAlternative(alternative)}>
          <span><strong>{alternative.leaveCost ? `${alternative.leaveCost} ${alternative.leaveCost === 1 ? "day" : "days"} leave` : "No leave"} → {alternative.totalDaysOff} days off</strong><small>{formatRange(alternative)}</small></span>
          {alternative.id === plan.id ? <span className={styles.optionSelected}>Selected</span> : null}
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
    ? `${formatRange(props.plan)} ${props.year}: ${props.plan.leaveCost ? `${props.plan.leaveCost} leave ${props.plan.leaveCost === 1 ? "day" : "days"}` : "no leave needed"} for ${props.plan.totalDaysOff} days off.${props.year === 2028 ? " Provisional dates." : ""}`
    : "Select a date to see a break.";

  if (mobile) return (
    <dialog id="break-details" ref={dialogRef} className={styles.mobileSheet} aria-labelledby={props.plan ? "break-title" : undefined}
      onCancel={(event) => { event.preventDefault(); closeSheet(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeSheet();
      }}>
      <div className={styles.sheetHandle} aria-hidden="true" />
      <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
      <DetailsContent {...props} closePlan={closeSheet} />
    </dialog>
  );
  return (
    <aside id="break-details" className={styles.detailsPanel} aria-label="Break details">
      <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
      <DetailsContent {...props} />
    </aside>
  );
}
