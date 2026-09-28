import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://long-weekend-sg.vercel.app"),
  applicationName: "Long Weekend SG",
  title: "Singapore Leave Planner 2027 & 2028 | Public Holidays & Long Weekends",
  description:
    "Plan Singapore public holidays and long weekends at a glance. Find the best annual leave days for longer breaks, with official 2027 dates and a provisional 2028 forecast.",
  keywords: [
    "Singapore public holidays 2027",
    "Singapore public holidays 2028",
    "Singapore long weekends",
    "Singapore leave planner",
    "annual leave planner Singapore",
    "Singapore school holidays",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Singapore Leave Planner — Public Holidays & Long Weekends",
    description:
      "Find the best annual leave days for longer breaks around Singapore public holidays.",
    siteName: "Long Weekend SG",
    type: "website",
    locale: "en_SG",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        {/*
          THESIS: The whole year is the interface; no marketing hero or themed dashboard stands between a person and the calendar.
          OWN-WORLD: Soft white ground, white month cards, cool-grey rules, near-black type, restrained red holidays, and pale-blue leave paths.
          STORY: Scan twelve months, touch one promising date, see the entire break illuminate, and understand the leave-to-rest exchange.
          FIRST VIEWPORT: Compact title and controls above a dense four-by-three year wall; one active card lifts and its white recommendation popover overlaps the grid.
          FORM: User-pinned clean white year wall; concept seed 4c1b00a8.
          FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
        */}
        <span data-design-contract="4c1b00a8" hidden />
        {children}
      </body>
    </html>
  );
}
