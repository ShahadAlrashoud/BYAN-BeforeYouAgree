import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TermClient from "./TermClient";
import { GLOSSARY, bySlug } from "@/data/glossary";

export function generateStaticParams() {
  return GLOSSARY.map((x) => ({ slug: x.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const term = bySlug(slug);
  if (!term) return {};
  const title = `${term.en.term} (${term.ar.term})`;
  return {
    title,
    description: term.en.def,
    alternates: { canonical: `/glossary/${slug}` },
    openGraph: { title: `${title} | BYAN`, description: term.en.def, url: `/glossary/${slug}` },
  };
}

export default async function TermPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const term = bySlug(slug);
  if (!term) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term.en.term,
    description: term.en.def,
    inDefinedTermSet: "https://www.byan.website/glossary",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TermClient id={slug} />
    </>
  );
}