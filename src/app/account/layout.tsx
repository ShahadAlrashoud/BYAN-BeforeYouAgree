import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { ACCOUNT_V2 } from "@/lib/flags";
import AccountShell from "./AccountShell";

// With the feature flag off, /account/* does not exist (404), so nothing changes for visitors.
export default function AccountLayout({ children }: { children: ReactNode }) {
    if (!ACCOUNT_V2) notFound();
    return <AccountShell>{children}</AccountShell>;
}
