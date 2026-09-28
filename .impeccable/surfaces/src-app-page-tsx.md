---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: []
---

# Home planner

- **Mode and job:** Operate. Singapore Monday–Friday workers scan one year and discover which leave days create longer continuous breaks.
- **Scope:** One public route with official 2027 data, provisional 2028 data, optional 2027 MOE school overlay, and an explicit Saturday-policy switch. No persistence, sharing, export, account, booking, or destination content.
- **Direction:** Warm editorial year wall. Ivory page, twelve softly rounded white month cards, quiet warm-grey rules, black typography, refined serif headings, and sparse plum, marigold, olive, and persimmon accents whose meaning is fixed. No props, dark grounds, gradients, decorative imagery, random card colours, or voice-assistant cues.
- **Memorable moment:** Hover, focus, or tap a holiday or suggested bridge day; its complete break illuminates in marigold across the calendar and a compact plum editorial panel states the leave-to-rest exchange with two alternatives.
- **Responsive behavior:** Four cards across on wide desktop, two on tablet, one on phone. Hover becomes tap; recommendation details become a bottom sheet on small screens.
- **Approved comp:** `.impeccable/mocks/approved-editorial-year-wall.png`. Treat generated dates and labels as compositional placeholders; implementation uses verified datasets and accessible semantic controls. User feedback after approval makes black/charcoal the default text and control colour.
- **Component grammar:** 20px card corners, 1px warm-grey borders, low warm shadows, compact tabular date numerals, softly joined range highlights, neutral pill controls, and 2px accessible focus rings.
- **Type ramp:** Newsreader for the 54–86px product title, 22–26px month names, and 29–38px recommendation headline; Geist Sans for 12–15px controls, calendar numerals, and source labels.
- **Palette:** page `#faf7f1`, card `#fffdf9`, text `#2f2926`, muted `#756c65`, border `#e8dfd4`, public holiday `#6b243e`, leave `#f5d36b`, school `#e5e7d2`, observed accent `#e65319`.
- **Implementation inventory:** all interface content, calendar geometry, marks, popover, switches, and icons are semantic HTML/CSS or authored inline SVG. No shipping raster assets are required; the comp remains review evidence only.
