import { redirect } from "next/navigation";

// /account is not a page of its own: it opens the Profile tab
export default function AccountIndex() {
    redirect("/account/profile");
}
