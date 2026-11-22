"use client";

import { useEffect, useRef } from "react";

// Modal dialog behaviour: scroll lock, Escape to close (unless busy), Tab kept inside the
// dialog, and focus returned to the control that opened it.
export function useModalBehavior({ open, busy, onClose }) {
    const dialogRef = useRef(null);
    const lastFocused = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        lastFocused.current = document.activeElement;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        function onKey(e) {
            if (e.key === "Escape") {
                if (!busy) onClose();
                return;
            }
            if (e.key !== "Tab" || !dialogRef.current) return;
            const items = Array.from(dialogRef.current.querySelectorAll("button:not([disabled]), input:not([disabled])"));
            if (!items.length) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }

        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
            if (lastFocused.current && document.contains(lastFocused.current)) lastFocused.current.focus();
        };
    }, [open, busy, onClose]);

    return dialogRef;
}
