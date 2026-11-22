import { redirect } from "next/navigation";
import { ACCOUNT_V2 } from "@/lib/flags";

// The old placeholder page. Settings now live in the Account page, under the Settings tab
// (/account/settings). This page only redirects there, and the placeholder text is gone.
// With the feature flag off, /settings is not offered anywhere, so it also redirects to the home page.
export default function SettingsPage() {
  redirect(ACCOUNT_V2 ? "/account/settings" : "/");
}