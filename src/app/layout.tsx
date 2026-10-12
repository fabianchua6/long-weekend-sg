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
        <span hidden data-design-contract="e6381b92">
          THESIS: A full-year calendar workspace makes the cost of a break visible.
          OWN-WORLD: White, black type, modest Newsreader headings, orange holiday circles and pale blue leave paths.
          STORY: Scan twelve months, preview dates, lock a break, compare in the stable right panel.
          FIRST VIEWPORT: Compact header, four-column borderless year map, fixed-width neutral details panel. Mobile uses a native dialog sheet.
          FORM: User-approved compact year workspace, seed e6381b92, composition a-compact.png.
          FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
        </span>
        {children}
      </body>
    </html>
  );
}
