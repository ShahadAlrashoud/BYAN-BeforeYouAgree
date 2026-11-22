import ContactClient from "./ContactClient";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
    return pageMetadata("contact");
}

export default function ContactPage() {
    return <ContactClient />;
}
