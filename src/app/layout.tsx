import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable}`}
    >
      <body>
        {/*
          THESIS: The annual planning wall feels like a considered travel magazine spread, never an HR dashboard.
          OWN-WORLD: Warm ivory paper, softly raised white cards, deep plum holidays, marigold leave paths, olive school breaks, and an expressive editorial serif paired with a quiet sans.
          STORY: Scan the whole year, choose a promising date, then follow the colored break path to a rich plum recommendation that makes the leave tradeoff immediate.
          FIRST VIEWPORT: Oversized serif brand on the left, compact warm pill controls on the right, and a dense four-column year wall below.
          FORM: User-approved warm editorial year wall; concept seed 8e92029a.
          FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
        */}
        <span data-design-contract="8e92029a" hidden />
        {children}
      </body>
    </html>
  );
}
