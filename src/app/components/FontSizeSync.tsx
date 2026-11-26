"use client";

import { useLayoutEffect } from "react";

// Applies the saved text size once the page hydrates. Renders nothing.
export default function FontSizeSync() {
  useLayoutEffect(() => {
    try {
      const s = localStorage.getItem("byan-font-size");
      if (s) document.documentElement.style.fontSize = s + "%";
    } catch {
      // localStorage can be unavailable (private mode, blocked storage)
    }
  }, []);

  return null;
}