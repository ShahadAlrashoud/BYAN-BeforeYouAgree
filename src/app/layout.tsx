import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Sans_Arabic, Noto_Naskh_Arabic } from "next/font/google";
import Providers from "./providers";
import Header from "./components/Header";
import Footer from "./components/Footer";

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
    // images: [{ url: "/og.png", width: 1200, height: 630, alt: "BYAN" }], // add once you have the file
  },
  twitter: {
    card: "summary_large_image",
    title: "BYAN - Before You Agree",
    description,
    // images: ["/og.png"],
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // NEW: suppressHydrationWarning, because the script below changes the html style before React loads
    <html
      lang="en"
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
        <Providers>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}