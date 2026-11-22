import HowItWorksClient from "./HowItWorksClient";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
    return pageMetadata("howItWorks");
}

export default function HowItWorksPage() {
    return <HowItWorksClient />;
}
