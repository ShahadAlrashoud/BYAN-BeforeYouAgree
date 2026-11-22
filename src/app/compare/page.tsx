import CompareClient from "./CompareClient";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
    return pageMetadata("compare");
}

export default function ComparePage() {
    return <CompareClient />;
}
