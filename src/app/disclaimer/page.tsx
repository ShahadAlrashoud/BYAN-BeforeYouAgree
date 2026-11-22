import DisclaimerClient from "./DisclaimerClient";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
    return pageMetadata("disclaimer");
}

export default function DisclaimerPage() {
    return <DisclaimerClient />;
}
