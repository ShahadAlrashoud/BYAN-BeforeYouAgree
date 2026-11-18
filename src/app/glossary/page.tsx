import type { Metadata } from "next";
import GlossaryClient from "./GlossaryClient";

export const metadata: Metadata = {
  title: "Glossary",
  description:
    "Plain-language definitions of common terms in Terms of Service and Privacy Policies, in English and Arabic.",
  alternates: { canonical: "/glossary" },
  openGraph: { title: "Glossary | BYAN", description: "Plain-language definitions of common legal and privacy terms.", url: "/glossary" },
};

export default function GlossaryPage() {
  return <GlossaryClient />;
}