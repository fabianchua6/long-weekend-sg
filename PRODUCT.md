# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js App Router, TypeScript, static-first rendering, CSS Modules, and CSS custom properties. No backend, database, authentication, analytics, or runtime data dependency in v1.

## Users

Singapore-based Monday-to-Friday workers planning annual leave around public holidays. Parents may optionally overlay MOE school holidays, but the product does not optimise around school dates.

## Product Purpose

Long Weekend SG helps people see a whole year at once and understand exactly which leave days turn public holidays and weekends into longer breaks. Success means a visitor can spot a useful break, understand its leave cost, and compare alternatives without filling in a form.

## Positioning

The calendar itself is the planner: hovering, focusing, or tapping holidays and suggested bridge days illuminates the complete continuous break and explains the exchange as “Take 2 leave days → 5 days off.”

## Operating Context

The primary view is twelve individual month cards. The launch covers official 2027 Singapore public holidays and a clearly provisional 2028 forecast. Users may toggle an official 2027 MOE school-holiday overlay and an employer-specific assumption that a Saturday public holiday is observed on the following Monday.

## Capabilities and Constraints

- English-only, Monday-first calendars, Monday-to-Friday work pattern.
- Recommendations use one to four annual-leave weekdays and show the best result plus up to two alternatives.
- Sunday public holidays use official observed-day rules.
- Saturday public holidays do not automatically add Monday unless the user enables the explicit workplace-policy switch.
- View-only v1: no accounts, persistence, manual leave builder, sharing, exports, destination suggestions, or bookings.
- Holiday and school data are versioned locally with source, verification date, and official or forecast status.

## Brand Commitments

The product name is “Long Weekend SG”. The voice is friendly and lightly Singaporean while factual caveats remain precise. The visual world is clean and minimal: a soft white page, white month cards, quiet grey borders, black typography, and a restrained red-and-blue status system. The calendar interaction—not themed decoration—is the memorable element. Avoid dark grounds, airport theming, heavy chrome, tactile props, and visually busy presentation.

## Evidence on Hand

- Ministry of Manpower’s official 2027 public-holiday release and entitlement rules.
- Ministry of Education’s official 2027 school terms and holidays.
- Secondary 2028 calendar projections, which must remain labelled as forecasts until MOM publishes official dates.
- No testimonials, usage claims, or customer evidence; none should be fabricated.

## Product Principles

- Make the leave-to-rest trade obvious at a glance.
- Never let forecast dates look official.
- Keep employer-policy assumptions explicit and conservative.
- Make every hover interaction equally usable by keyboard and touch.
- Prefer a focused annual planning canvas over feature breadth.

## Accessibility & Inclusion

All date interactions must work with hover, keyboard focus, click, and tap. Colour cannot be the only status cue. Motion respects reduced-motion preferences, and recommendation details use semantic labels suitable for screen readers.
