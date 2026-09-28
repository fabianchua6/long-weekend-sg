---
name: Long Weekend SG
description: A warm editorial annual planner with black typography and semantic colour pops.
colors:
  page: "#faf7f1"
  surface: "#fffdf9"
  ink: "#2f2926"
  muted: "#756c65"
  line: "#e8dfd4"
  holiday: "#6b243e"
  holiday-soft: "#f6e9ee"
  leave: "#f5d36b"
  leave-soft: "#fbe9ac"
  school: "#e5e7d2"
  persimmon: "#e65319"
typography:
  editorial:
    fontFamily: "Newsreader, Georgia, serif"
    fontWeight: 530
  body:
    fontFamily: "Geist, sans-serif"
    fontWeight: 400
rounded:
  micro: "4px"
  wash: "7px"
  day: "8px"
  range: "9px"
  compact: "10px"
  control: "15px"
  popover: "18px"
  card: "20px"
  sheet: "22px"
  pill: "999px"
---

# Design System: Long Weekend SG

## Overview

**Creative North Star: “The Editorial Year Wall”**

The calendar remains the product, but it now feels closer to a considered travel or food magazine than an HR utility. Warm ivory creates a paper-like ground; tactile white cards give each month its own quiet page; an expressive serif brings humanity to the title, month names, and recommendations. Black and charcoal carry the interface. Colour appears only when it explains a date or selected plan.

## Colour

- **Warm Paper** (`#faf7f1`): the page ground.
- **Soft White** (`#fffdf9`): month cards and controls.
- **Charcoal Ink** (`#2f2926`): titles, month names, controls, and calendar text.
- **Deep Plum** (`#6b243e`): official holidays and the recommendation panel.
- **Marigold** (`#f5d36b` / `#fbe9ac`): suggested leave and active break ranges.
- **Quiet Olive** (`#e5e7d2`): optional MOE school-break shading.
- **Persimmon** (`#e65319`): the small observed-day detail.

**Black First.** Plum is not a default text colour. All headings outside the recommendation panel are charcoal, and all switches share the same neutral charcoal active state.

**Meaningful Colour.** Every non-neutral hue maps to one calendar meaning. Do not use alternating card colours or decorative accent blocks.

## Typography

Newsreader carries only the large editorial moments: the product name, month names, and recommendation exchange. Geist Sans carries controls, date numerals, caveats, labels, and sources.

- **Product title:** Newsreader, fluid `3.4rem–5.4rem`, medium weight, compact line height.
- **Month names:** Newsreader, `1.42rem` desktop and `1.6rem` mobile.
- **Recommendation:** Newsreader, fluid `1.8rem–2.35rem` with an ivory foreground on plum.
- **Controls and calendar:** Geist Sans, compact but not monospaced, with tabular numerals for date alignment.

## Layout

The page uses a centered shell capped at `1480px`. The year wall is four columns on wide screens, three below `1220px`, two below `880px`, and one below `620px`. Six fixed calendar rows preserve alignment across months. The large title and compact pill controls share the top region; on smaller screens they stack without adding marketing copy.

## Shape and Depth

Month cards use 20px corners with no border and a low warm shadow. Controls use 15px corners. Day cells use 8–9px rounding, while holiday dates remain circular. The selected month lifts slightly with a deeper shadow. The recommendation uses a broad 20–22px radius and a richer shadow, so it reads as the only saturated layer.

## Components

### Year and settings controls

A single directional year control reads `2027 →` and `← 2028`; changing years slides the calendar in the same direction. Secondary preferences live in one Settings popover. Both switches use identical grey-to-charcoal tracks and their labels remain black. The provisional badge and notice use a pale yellow treatment because they convey forecast status, not decoration.

### Month cards

Cards are soft white, borderless, rounded, and lightly elevated. Month names are editorial but black. Small grey month indices and restrained weekday labels keep attention on the dates.

### Calendar states

Official holidays are solid plum circles. Forecast holidays use a white center with a plum outline. Suggested leave is a tiny marigold dot until selected; an active continuous range becomes a joined pale-marigold path. School holidays receive an olive wash. Observed days add a persimmon dot.

### Recommendation panel

The recommendation is the deliberate colour moment: a deep plum panel with ivory editorial type and a marigold arrow and leave-date line. It leads with “Take N leave days → N days off,” then the range, exact leave dates, and up to two alternatives. On phones it becomes a fixed bottom sheet with a dimmed backdrop.

## Rules

### Do

- Keep black or charcoal as the default text and control colour.
- Preserve the full-year scan and fast direct calendar interaction.
- Use colour only for holiday, leave, school, observed, or forecast meaning.
- Keep keyboard, hover, tap, focus restoration, and reduced-motion behavior intact.

### Don’t

- Do not turn page titles, month names, and switches plum.
- Do not add random coloured month cards, gradients, travel illustrations, or airport motifs.
- Do not imitate the reference app’s voice-input controls or questionnaire layout.
- Do not add explanatory marketing copy above the year wall.
