---
version: 2
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/components/planner/planner.tsx", "src/components/planner/month-card.tsx", "src/components/planner/plan-details.tsx", "src/components/planner/planner.module.css"]
---

# Home planner

- **Mode and job:** Operate. Singapore Monday-to-Friday workers scan one year and discover which leave days create longer continuous breaks.
- **Scope:** One public route with official 2027 data, provisional 2028 data, optional 2027 MOE school overlay, and an explicit Saturday-policy switch. No persistence, sharing, export, account, booking, or destination content.
- **Direction:** Compact white year workspace. Twelve months form the primary map; black and charcoal type carries the interface; orange public-holiday marks and pale-blue leave highlights carry meaning. The page has no themed props, dark ground, gradients, or decorative imagery.
- **Memorable moment:** Hover, focus, or tap a holiday or suggested bridge day. The complete continuous break illuminates across the year, and the fixed right panel states the leave-to-rest exchange with alternatives.
- **Responsive behavior:** Four month columns at `1251px` and wider, three at `1250px` and below, two at `1000px` and below, and one at `520px` and below. At `760px` and below, the desktop details panel becomes a native modal bottom sheet. The year transition slides in the direction of the selected year.
- **Approved comps:** `.impeccable/mocks/year-workspace/a-compact.png` (`1536×1024`) and `.impeccable/mocks/year-workspace/mobile.png` (`1024×1536`). The first desktop layout with mobile bottom sheet was approved by the user with “Deploy and let me seee”. Generated dates and labels remain compositional placeholders; implementation uses verified datasets and accessible semantic controls.
- **Component grammar:** Borderless month surfaces, compact calendar cells, 1px cool-grey header and panel separation, no default card shadow, and restrained elevation only for open settings, active details, and the mobile sheet. Holiday dates are circular; range highlights join across cells.
- **Type ramp:** Newsreader for the product title and modest month and panel headings; Geist for controls, dates, labels, caveats, and source links. Date numerals use tabular figures.
- **Palette:** page and surface `#ffffff`, subtle utility `#f3f5f7`, ink `#171a1f`, muted `#626975`, line `#e5e8ec`, holiday orange `#b7430b`, holiday wash `#ffeadb`, leave blue `#bbdcfc`, leave wash `#e4f1ff`, school green `#e5eddc`, focus blue `#326ba2`.
- **Layout rhythm:** header border and compact controls at the top; year canvas uses `24px 30px 16px` base padding, `24px` legend separation, `24px` column and row gap, `10px` month-header gap, and `28px` day rows on the current desktop layout.

## Asset manifest

The asset producer second opinion is intentionally empty for production imagery. This interface is a calendar and its visible content remains crisp semantic code.

### Produce

- None. No generated raster is required by the approved composition.

### Direct

- None. The approved PNGs are review references only and must not ship as page imagery.

### Semantic

- **Year workspace:** HTML sections and CSS Grid own the four, three, two, and one-column calendar topology.
- **Month cards and date cells:** semantic month sections, weekday labels, buttons, and date-only values own all calendar text and states.
- **Holiday and leave marks:** CSS shapes and color variables own solid orange circles, forecast outlines, pale-blue ranges, school shading, and observed-day details.
- **Year switch and Settings:** semantic buttons, a native checkbox switch, inline SVG icons, and CSS transitions own the controls.
- **Desktop details panel:** an `aside` owns the fixed-width recommendation rail and its accessible live announcement.
- **Mobile details:** a native `dialog` owns the bottom sheet, backdrop, Escape handling, and focus behavior.

### Provenance and QA

- Review-only source: `.impeccable/mocks/year-workspace/a-compact.png` and `.impeccable/mocks/year-workspace/mobile.png`.
- No shipping raster assets means no raster prompt embedding or crop cleanup is required.
- Browser automation timed out during the final visual pass, so this record does not claim screenshot-level visual fidelity approval. Code-level direction and responsive rules are documented from the current implementation; live browser verification remains the release limitation.
