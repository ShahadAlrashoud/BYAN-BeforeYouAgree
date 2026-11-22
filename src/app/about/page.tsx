import AboutClient from "./AboutClient";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
    return pageMetadata("about");
}

export default function AboutPage() {
    return <AboutClient />;
}
