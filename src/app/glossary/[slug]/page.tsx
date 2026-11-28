import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TermClient from "./TermClient";
import JsonLd from "../../components/JsonLd";
import { GLOSSARY, bySlug, localized } from "@/data/glossary";
import { buildMetadata, getRequestLang } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return GLOSSARY.map((x) => ({ slug: x.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const term = bySlug(slug);
  if (!term) return {};
  const lang = await getRequestLang();

  // Unreviewed Arabic is never published: a pending entry shows its English text in the
  // Arabic view, so the Arabic URL of that entry is kept out of the index (noindex) and its
  // canonical points at the English page. English <-> Arabic hreflang is only added for
  // entries whose Arabic has been approved.
  const arabicReady = !("arPending" in term && term.arPending);
  const view = localized(term, lang);
  const title = lang === "ar" && arabicReady ? `${term.ar.term} | بيان` : `${term.en.term} | BYAN`;

  return buildMetadata({
    title,
    description: view.def,
    path: `/glossary/${slug}`,
    lang,
    hasArabic: arabicReady,
    noindex: lang === "ar" && !arabicReady,
  });
}

export default async function TermPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const term = bySlug(slug);
  if (!term) notFound();
  const lang = await getRequestLang();
  const view = localized(term, lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: view.term,
    description: view.def,
    inLanguage: view.lang,
    url: lang === "ar" ? `${SITE_URL}/ar/glossary/${slug}` : `${SITE_URL}/glossary/${slug}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: lang === "ar" ? "مصطلحات بيان" : "BYAN Glossary",
      url: lang === "ar" ? `${SITE_URL}/ar/glossary` : `${SITE_URL}/glossary`,
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <TermClient id={slug} />
    </>
  );
}