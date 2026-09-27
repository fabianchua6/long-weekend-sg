# Long Weekend SG

A one-page Singapore leave planner that turns the year into a visual map of public holidays, suggested leave days, and longer breaks.

## What it includes

- 2027 official MOM public holidays.
- 2028 provisional forecasts with confidence labels.
- Ranked one-to-four-day leave recommendations.
- Sunday observed-day handling and an opt-in Saturday workplace policy.
- Optional 2027 MOE school-holiday shading that does not change rankings.
- Hover, keyboard, click, and mobile bottom-sheet interactions.
- No accounts, analytics, database, or runtime data dependency.

## Local development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use `?year=2028` to open the forecast view directly.

## Checks

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

## Data sources

- [MOM public holidays for 2027](https://www.mom.gov.sg/newsroom/press-releases/2026/0618-public-holidays-for-2027)
- [MOM public holiday entitlement and pay](https://www.mom.gov.sg/employment-practices/public-holidays-entitlement-and-pay)
- [MOE school terms and holidays for 2027](https://www.moe.gov.sg/news/press-releases/20260714-school-terms-and-holidays-for-2027)

Forecast dates are stored separately and remain visibly provisional until MOM publishes the official 2028 calendar.
