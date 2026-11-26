import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Providers from "./providers";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HelpButton from "./components/HelpButton";
import FontSizeSync from "./components/FontSizeSync";
import { getRequestLang } from "@/lib/seo";
import { OG_IMAGE } from "@/lib/site";
import { aiFlags, aiLimits } from "@/lib/aiConfig";
import FlagsProvider from "./components/FlagsProvider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.byan.website";
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
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary",
    title: "BYAN - Before You Agree",
    description,
    images: [OG_IMAGE.url],
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const lang = await getRequestLang();

  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Noto+Naskh+Arabic:wght@500;700&display=swap"
        />
      </head>
      <body>
        <Providers initialLang={lang}>
          <FlagsProvider
            value={{
              newHome: aiFlags().newHome,
              dailyAllowance: aiFlags().dailyAllowance,
              cacheTtlDays: aiLimits().cacheTtlDays,
            }}
          >
            <FontSizeSync />
            <Header newHome={aiFlags().newHome} showPopular={aiFlags().popularPage} />
            <main id="main">{children}</main>
            <Footer showPopular={aiFlags().popularPage} />
            <HelpButton />
          </FlagsProvider>
        </Providers>
      </body>
    </html>
  );
}