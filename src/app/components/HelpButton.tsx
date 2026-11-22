"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "../providers";
import TutorialModal from "./TutorialModal";

const labels = {
    en: { help: "Help", title: "Help: how to use BYAN" },
    ar: { help: "مساعدة", title: "مساعدة: كيفية استخدام بيان" },
};

// Fixed "?" button in the bottom-right corner of every page.
// - On the results page it opens that page's "How to read this page" panel.
// - Everywhere else it opens the short BYAN tutorial (also shown once to first-time visitors).
export default function HelpButton() {
    const { lang, colors } = useTheme();
    const pathname = usePathname();
    const t = labels[lang === "ar" ? "ar" : "en"];

    const [tutorialOpen, setTutorialOpen] = useState(false);
    const onResults = pathname === "/results" || pathname?.startsWith("/results/");

    /* Auto-open the tutorial once for first-time visitors */
    useEffect(() => {
        try {
            if (!localStorage.getItem("byan-tutorial-seen")) {
                setTutorialOpen(true);
            }
        } catch {}
    }, []);

    const closeTutorial = () => {
        setTutorialOpen(false);
        try {
            localStorage.setItem("byan-tutorial-seen", "1");
        } catch {}
    };

    const handleClick = () => {
        if (onResults) {
            window.dispatchEvent(new CustomEvent("byan:toggle-results-help"));
        } else {
            setTutorialOpen(true);
        }
    };

    return (
        <>
            <button
                type="button"
                className="byan-help-fab"
                onClick={handleClick}
                aria-label={t.help}
                title={t.title}
                aria-haspopup={onResults ? undefined : "dialog"}
                aria-controls={onResults ? "byan-help-panel" : undefined}
                style={{
                    background: colors.accent,
                    color: colors.onAccent,
                }}
            >
                <span aria-hidden="true">?</span>
            </button>

            <TutorialModal open={tutorialOpen} onClose={closeTutorial} />
        </>
    );
}
