"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useTheme } from "../providers";
import { localizeHref } from "@/lib/lang";

// Drop-in replacement for next/link. In Arabic, links to pages that have an Arabic
// version (for example "/about") go to the Arabic URL ("/ar/about"). Everything else
// (external links, pages with no Arabic URL, links that are already prefixed) is untouched.
export default function LocalizedLink({ href, ...props }: ComponentProps<typeof NextLink>) {
    const { lang } = useTheme();
    const finalHref = typeof href === "string" ? localizeHref(href, lang) : href;
    return <NextLink href={finalHref} {...props} />;
}
