import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ACCOUNT_V2 } from "@/lib/flags";
import ConfirmEmail from "./ConfirmEmail";

// The page the verification link opens. Hidden while the feature flag is off.
export default function ConfirmEmailPage() {
    if (!ACCOUNT_V2) notFound();
    return (
        <Suspense fallback={null}>
            <ConfirmEmail />
        </Suspense>
    );
}
