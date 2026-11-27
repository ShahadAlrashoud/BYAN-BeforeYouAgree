import HomeClient from "./HomeClient";
import WelcomeClient from "./welcome/WelcomeClient";
import JsonLd from "./components/JsonLd";
import { aiFlags } from "@/lib/aiConfig";
import { pageMetadata, getRequestLang } from "@/lib/seo";
import { SEO_COPY } from "@/data/seoCopy";
import { SITE_URL, LOGO_PATH } from "@/lib/site";

export async function generateMetadata() {
    return pageMetadata("home");
}

export default async function HomePage() {
    const lang = await getRequestLang();
    const url = lang === "ar" ? `${SITE_URL}/ar` : `${SITE_URL}/`;
    const copy = SEO_COPY.home[lang];

    // NEW_HOME and its related flags are read per request (getRequestLang already makes this page dynamic).
    const flags = aiFlags();

    const website = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url,
        name: "BYAN",
        alternateName: lang === "ar" ? "بيان" : "Before You Agree",
        description: copy.description,
        inLanguage: ["en", "ar"],
        publisher: { "@id": `${SITE_URL}/#organization` },
    };

    const organization = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "BYAN",
        alternateName: ["Before You Agree", "بيان"],
        url: SITE_URL,
        logo: `${SITE_URL}${LOGO_PATH}`,
    };

    return (
        <>
            <JsonLd data={website} />
            <JsonLd data={organization} />
            {flags.newHome ? (
                <WelcomeClient showPopular={flags.popularPage} showAllowance={flags.dailyAllowance} />
            ) : (
                <HomeClient />
            )}
        </>
    );
}
