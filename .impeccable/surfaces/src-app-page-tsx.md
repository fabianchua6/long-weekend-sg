---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: []
---

# Home planner

- **Mode and job:** Operate. Singapore Monday–Friday workers scan one year and discover which leave days create longer continuous breaks.
- **Scope:** One public route with official 2027 data, provisional 2028 data, optional 2027 MOE school overlay, and an explicit Saturday-policy switch. No persistence, sharing, export, account, booking, or destination content.
- **Direction:** Clean white year wall. Soft off-white page, twelve white month cards, quiet grey rules, near-black type, restrained red public-holiday marks, and pale blue leave highlights. No theme, props, dark grounds, gradients, or decorative imagery.
- **Memorable moment:** Hover, focus, or tap a holiday or suggested bridge day; its complete break illuminates across the calendar and a compact white popover states the leave-to-rest exchange with two alternatives.
- **Responsive behavior:** Four cards across on wide desktop, two on tablet, one on phone. Hover becomes tap; recommendation details become a bottom sheet on small screens.
- **Approved comp:** `.impeccable/mocks/approved-white-year-wall.png`. Treat generated dates and labels as compositional placeholders; implementation uses verified datasets and accessible semantic controls.
- **Component grammar:** 12px card corners, 1px cool-grey borders, no default shadow, a soft elevated shadow only for active cards and popovers, compact tabular date numerals, pill-shaped day highlights, and 2px accessible focus rings.
- **Type ramp:** Geist Sans; 36–44px product title, 18–20px month names, 13–15px controls/body, 11–12px date and source labels.
- **Palette:** page `#f6f7f8`, card `#ffffff`, text `#111318`, muted `#667085`, border `#e3e7ec`, public holiday `#e5383b`, leave `#dceeff`, leave ink `#1769aa`, school `#fff0f1`.
- **Implementation inventory:** all interface content, calendar geometry, marks, popover, switches, and icons are semantic HTML/CSS or authored inline SVG. No shipping raster assets are required; the comp remains review evidence only.
