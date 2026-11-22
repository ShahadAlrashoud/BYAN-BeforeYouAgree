import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Sans_Arabic, Noto_Naskh_Arabic } from "next/font/google";
import Providers from "./providers";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HelpButton from "./components/HelpButton";
import { getRequestLang } from "@/lib/seo";
import { OG_IMAGE } from "@/lib/site";
import { aiFlags } from "@/lib/aiConfig";

const body = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const display = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["500", "700"],
  variable: "--font-display",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL = "https://www.byan.website";
const description =
  "Analyze Terms of Service and Privacy Policy pages with an analysis of the risks involved.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BYAN - Before You Agree",
    template: "%s | BYAN",
  },
  description,
  openGraph: {
    type: "website",
    siteName: "BYAN",
    title: "BYAN - Before You Agree",
    description,
    url: "/",
    locale: "en_US",
    alternateLocale: ["ar_SA"],
    // Default share image: the BYAN logo (pages with their own metadata set the same)
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary",
    title: "BYAN - Before You Agree",
    description,
    images: [OG_IMAGE.url],
  },
  // No site-wide canonical here: each page sets its own. A canonical of "/" in the layout
  // would tell search engines that every page without its own is a copy of the homepage.
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // "ar" on /ar/* URLs (set by src/proxy.ts), otherwise "en"
  const lang = await getRequestLang();

  return (
    // NEW: suppressHydrationWarning, because the script below changes the html style before React loads
    <html
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`${body.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      {/* NEW: applies the saved text size before first paint (no flash) */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=localStorage.getItem("byan-font-size");if(s)document.documentElement.style.fontSize=s+"%"}catch(e){}`,
          }}
        />
      </head>
      <body>
        <Providers initialLang={lang}>
          <Header />
          <main id="main">{children}</main>
          {/* The /popular link exists only while POPULAR_PAGE is on (read per request) */}
          <Footer showPopular={aiFlags().popularPage} />
          <HelpButton />
        </Providers>
      </body>
    </html>
  );
}