---
name: Long Weekend SG
description: A clean annual planning wall that makes leave-to-rest tradeoffs obvious.
colors:
  page: "#f6f7f8"
  surface: "#ffffff"
  ink: "#111318"
  muted: "#596579"
  faint: "#5f6d81"
  line: "#e3e7ec"
  line-strong: "#cfd5dc"
  holiday: "#c92f35"
  holiday-soft: "#fff0f1"
  leave: "#dceeff"
  leave-ink: "#1769aa"
  school: "#fff4dc"
typography:
  display:
    fontFamily: "Geist, sans-serif"
    fontSize: "clamp(2rem, 3.2vw, 3.35rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.065em"
  body:
    fontFamily: "Geist, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.45
  calendar:
    fontFamily: "Geist Mono, monospace"
    fontSize: "0.68rem"
    fontWeight: 400
    lineHeight: 1
rounded:
  day: "7px"
  control: "10px"
  card: "12px"
  sheet: "15px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  month-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "16px"
  holiday-day:
    backgroundColor: "{colors.holiday}"
    textColor: "{colors.surface}"
    rounded: "999px"
    size: "27px"
  leave-day:
    backgroundColor: "{colors.leave}"
    textColor: "{colors.leave-ink}"
    rounded: "{rounded.day}"
    size: "27px"
---

# Design System: Long Weekend SG

## Overview

**Creative North Star: “The Clear Year Wall”**

The year itself is the product. The interface should feel calm, useful, and immediately scannable: a soft off-white ground, twelve white month cards, near-black type, and only enough color to explain calendar meaning. It is deliberately plain in the best sense—no airport theming, decorative imagery, dark dashboard chrome, or marketing layer between the user and the dates.

**Key Characteristics:**

- Dense but breathable annual overview.
- Red is reserved for public holidays; pale blue explains leave plans.
- Official, forecast, observed, and school-calendar states are explicit.
- Interaction adds depth temporarily; the resting interface stays flat.

## Colors

The palette is neutral-first, with a Singapore-red holiday accent and a cool-blue planning accent.

- **Paper Grey** (`#f6f7f8`): page ground.
- **Clear White** (`#ffffff`): cards, controls, popovers, and sheets.
- **Near Black** (`#111318`): primary headings and high-value text.
- **Quiet Slate** (`#596579`): supporting copy.
- **Singapore Red** (`#c92f35`): official holiday markers and holiday emphasis.
- **Planning Blue** (`#1769aa` / `#dceeff`): selected leave and highlighted break ranges.
- **School Cream** (`#fff4dc`): optional school-holiday shading only.

**The Meaningful Color Rule.** Never introduce color as decoration. Every non-neutral hue must communicate a calendar state.

## Typography

**Display Font:** Geist, sans-serif  
**Body Font:** Geist, sans-serif  
**Calendar Font:** Geist Mono, monospace

The combination is crisp and contemporary. Geist carries product copy; Geist Mono keeps dates aligned and easy to scan.

- **Display:** bold, tightly tracked, fluid `2rem–3.35rem`; only for the page title.
- **Month title:** bold `0.94rem`; quiet hierarchy inside cards.
- **Body:** regular `0.9rem–1rem`; short, plain sentences.
- **Calendar:** `0.68rem`, tabular numerals; day cells and small indices.
- **Labels:** compact uppercase with generous tracking for status and section cues.

## Layout

The page uses one centered shell capped at `1480px`. The annual wall is four columns on wide screens, three below `1220px`, two below `880px`, and one below `620px`. Calendars start on Monday and use a fixed six-week grid so every month card aligns. Controls sit opposite the title on desktop and stack into full-width rows on mobile.

## Elevation & Depth

The system is flat at rest. One-pixel cool-grey borders separate surfaces. Shadows appear only for an active month and its recommendation panel; the mobile sheet uses a dimmed backdrop to establish modality.

**The Flat-by-Default Rule.** Do not add persistent card shadows. Elevation is a response to interaction, not decoration.

## Shapes

Cards use 12px corners, controls 10px, and date cells 7px. Public holidays are circular. Switches and compact status badges use full pill radii. Borders remain thin and cool grey.

## Components

### Year switcher and toggles

Controls are white or very light grey, compact, and bordered. Selected year state uses a white inset surface with a restrained shadow. Switches become near-black when enabled. Every control retains a visible blue focus ring.

### Month cards

White 12px cards with a one-pixel border and 16px internal padding. An active card receives a pale-blue border and slight lift. Month indices stay secondary; the dates remain the visual focus.

### Calendar cells

Holiday cells are solid red circles; forecast holidays are white with a red outline. Suggested leave dates use a small blue dot until selected. Active leave dates use pale blue with a stronger blue inset border. School dates use cream shading and never affect recommendation rankings.

### Recommendation panel

The panel leads with the exchange—leave days to total days off—then gives the date range, exact leave dates, and at most two alternatives. On desktop it opens beside the active month so the clicked cell remains usable. On mobile it becomes a dismissible bottom sheet.

## Do's and Don'ts

### Do:

- **Do** keep the full year visible as early as the viewport permits.
- **Do** use concise, plain-language employment and forecast caveats.
- **Do** preserve keyboard, hover, tap, and reduced-motion support.
- **Do** use red and blue only for their established calendar meanings.

### Don't:

- **Don't** reintroduce dark airport, departure-board, or travel-poster styling.
- **Don't** add decorative gradients, illustrations, logos, or heavy shadows.
- **Don't** hide official-versus-forecast status behind tooltips.
- **Don't** turn the page into a marketing landing page; the calendar is the hero.
