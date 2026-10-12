---
name: Long Weekend SG
description: A compact, full-year Singapore leave planner with black typography and semantic colour pops.
colors:
  page: "#ffffff"
  surface: "#ffffff"
  subtle: "#f3f5f7"
  ink: "#171a1f"
  muted: "#626975"
  line: "#e5e8ec"
  holiday: "#b7430b"
  holiday-soft: "#ffeadb"
  leave: "#bbdcfc"
  leave-soft: "#e4f1ff"
  school: "#e5eddc"
  focus: "#326ba2"
typography:
  editorial:
    fontFamily: "Newsreader, Georgia, serif"
    fontWeight: 530
    lineHeight: 1.2
  body:
    fontFamily: "Geist, sans-serif"
    fontWeight: 400
    lineHeight: 1.45
rounded:
  day: "5px"
  range: "6px"
  control: "8px"
  settings: "12px"
  sheet: "20px"
  pill: "999px"
spacing:
  page-x: "30px"
  canvas-top: "24px"
  panel-x: "24px"
components:
  year-switch:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "40px"
  settings-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "40px"
  holiday-day:
    backgroundColor: "{colors.holiday}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    size: "27px"
  leave-day:
    backgroundColor: "{colors.leave}"
    textColor: "{colors.ink}"
    rounded: "{rounded.range}"
---

# Design System: Long Weekend SG

## Overview

**Creative North Star: “The Quiet Year Workspace”**

Long Weekend SG is a practical calendar workspace. The year view is the hero: twelve months sit in a compact map so a visitor can scan public holidays, bridge days, and continuous breaks without leaving the page. The interface uses white space, black type, and a small set of semantic colour marks. It should feel closer to a focused calendar tool than a themed travel landing page.

The visual system is flat at rest. Month cards have no visible border or decorative shadow. The right details panel provides stable structure on desktop, while the native dialog sheet provides the same information on small screens. Newsreader adds a modest editorial voice to the product and month headings; Geist keeps dates, controls, labels, and source details clear.

**Key Characteristics:**

- Full-year calendar workspace
- White surfaces and black default typography
- Orange public-holiday marks and pale-blue leave ranges
- Fixed-width desktop details panel and native mobile dialog

## Colors

The palette is neutral first. Orange identifies public holidays; pale blue identifies suggested leave and selected breaks; green is reserved for school-date shading; cool blue appears only for keyboard focus.

### Primary

- **Holiday Orange** (`#b7430b`): public holidays, observed-day marks, and the main calendar accent.

### Secondary

- **Leave Blue** (`#bbdcfc`): selected leave days and active plan emphasis.
- **Leave Wash** (`#e4f1ff`): the continuous break path across dates and months.

### Tertiary

- **School Green** (`#e5eddc`): optional MOE school-holiday overlay.
- **Focus Blue** (`#326ba2`): keyboard focus ring only.

### Neutral

- **Page White** (`#ffffff`): page background and white controls.
- **Calendar Mist** (`#f3f5f7`): weekend cells, settings states, and small utility surfaces.
- **Calendar Ink** (`#171a1f`): product title, month names, dates, and controls.
- **Muted Slate** (`#626975`): weekday labels, supporting text, and sources.
- **Cool Line** (`#e5e8ec`): header and panel separation.

### Named Rules

**The Meaningful Colour Rule.** Every non-neutral colour must explain a calendar state. Do not use accent colour for decoration or for category-specific controls.

## Typography

**Display Font:** Newsreader (with Georgia, serif)

**Body Font:** Geist (with sans-serif)

**Character:** Newsreader is restrained and editorial. Geist is compact, neutral, and easy to scan in a dense calendar.

### Hierarchy

- **Display** (550, `1.85rem`, `1.1`): product title in the compact header.
- **Headline** (520, `1.28rem`, `1.2`): month names across the year map.
- **Title** (500, `1.9rem`, `1.15`): the selected break name in the details panel.
- **Body** (400, `0.8rem–1rem`, `1.45`): plan details, controls, and source information.
- **Label** (400, `0.62rem–0.76rem`, normal tracking): weekday labels, status badges, and legend text.

### Named Rules

**The Small Editorial Rule.** Use Newsreader for product and month headings only. Calendar numerals, switches, caveats, and source links remain in Geist.

## Layout

The page is a full-width workspace with a compact header and a two-region body. The year canvas fills the available width; the desktop details panel stays fixed at `320px` on the base layout, `285px` below `1250px`, and `360px` above `1600px`.

The calendar uses seven equal weekday columns and Monday-first weeks. It shows four month columns at `1251px` and wider, three columns at `1250px` and below, two columns at `1000px` and below, and one column at `520px` and below. At `760px` and below, the side panel is replaced by a native modal dialog sheet. The year control swaps between 2027 and 2028 with a directional slide and respects reduced motion.

## Elevation & Depth

The workspace is flat by default. The month map has no card borders and no default shadow; the header line and panel divider provide the main structure. Settings and the active details layer may use a quiet shadow so they separate from the calendar without becoming decorative objects. The mobile dialog uses a restrained upward shadow and a backdrop.

### Named Rules

**The Flat Workspace Rule.** Keep the year map visually quiet. Use elevation only when a layer is open, active, or needs to sit above the calendar.

## Shapes

Day cells use small 5–6px corners. Holiday dates are circular. Range fills join across adjacent cells with rounded ends. Controls use an 8px radius; the settings menu uses a 12px radius; the mobile sheet uses a 20px top radius. Month cards remain borderless and transparent.

## Components

### Buttons

- **Shape:** compact 8px controls with no visible border.
- **Primary:** the year switch uses black text, tabular numerals, and a 40px minimum height.
- **Hover / Focus:** hover uses a cool mist background; keyboard focus uses a 2px Focus Blue outline with a 3px offset.
- **Secondary / Ghost:** Settings is a neutral text button with the same treatment as the year switch.

### Cards / Containers

- **Corner Style:** month cards do not present a card silhouette; day highlights use small rounded cells.
- **Background:** white page, cool mist utility surfaces, and a neutral grey details panel.
- **Shadow Strategy:** flat at rest; open settings, active plans, and the mobile sheet may lift softly.
- **Border:** no month-card border; a single cool line separates the header and desktop details panel.
- **Internal Padding:** year canvas starts at `24px 30px 16px`; details panel uses `36px 24px` on the base layout.

### Inputs / Fields

- **Style:** settings switches use a 34px by 20px neutral track with a white knob.
- **Focus:** the hidden checkbox receives the same visible 2px Focus Blue ring through the switch.
- **Disabled:** unavailable 2028 school overlay is muted and remains non-interactive.

### Navigation

- **Style:** the year switch shows one year and one directional chevron. The active year is never encoded only by colour.
- **States:** 2027 is marked Official; 2028 is marked Provisional. Changing year uses a directional slide.
- **Mobile treatment:** controls wrap below the product title; Settings collapses to its icon button.

### Calendar Day

The day is the primary interactive unit. It supports hover, keyboard focus, click, and tap. Official holidays use a solid orange circle; forecast holidays keep a white center and orange outline; suggested leave uses a small blue marker; an active plan joins its range across every affected month.

### Recommendation Details

The details panel leads with the total days off, leave cost, date range, leave dates, public holidays, and alternatives. A locked plan moves the same content into a native mobile dialog at `760px` and below.

## Do's and Don'ts

### Do:

- **Do** make the twelve-month year wall the primary experience.
- **Do** keep all ordinary text and controls black or charcoal.
- **Do** reserve orange, blue, green, and focus blue for their documented calendar meanings.
- **Do** keep recommendation details available without hover through focus, click, tap, and the mobile dialog.
- **Do** keep official and provisional dates visually distinct and textually labelled.

### Don't:

- **Don't** add dark backgrounds, airport motifs, gradients, or decorative travel imagery.
- **Don't** use plum or multiple coloured toggle treatments as default interface chrome.
- **Don't** add borders or shadows to every month card.
- **Don't** replace the year workspace with a single-month flow.
- **Don't** ship the review comps as page imagery; the interface remains semantic HTML, CSS, and inline SVG.
