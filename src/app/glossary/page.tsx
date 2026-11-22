import GlossaryClient from "./GlossaryClient";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata("glossary");
}

export default function GlossaryPage() {
  return <GlossaryClient />;
}