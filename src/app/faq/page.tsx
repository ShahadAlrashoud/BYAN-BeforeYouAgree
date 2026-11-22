import FAQClient from "./FAQClient";
import JsonLd from "../components/JsonLd";
import { pageMetadata, getRequestLang } from "@/lib/seo";
import { FAQ } from "@/data/faq";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata() {
    return pageMetadata("faq");
}

export default async function FAQPage() {
    const lang = await getRequestLang();

    // Every question and answer, taken from the same data the visible page uses
    const faqPage = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        url: lang === "ar" ? `${SITE_URL}/ar/faq` : `${SITE_URL}/faq`,
        inLanguage: lang,
        mainEntity: FAQ[lang].map((item: { q: string; a: string }) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
    };

    return (
        <>
            <JsonLd data={faqPage} />
            <FAQClient />
        </>
    );
}
