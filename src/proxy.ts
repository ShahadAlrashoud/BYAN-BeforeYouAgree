import { NextResponse, type NextRequest } from "next/server";

// Arabic versions of the public pages live under /ar (for example /ar/about).
// There are no separate files for them: /ar/about is rewritten to /about, and the
// request header "x-byan-lang" tells the layout and metadata which language to render.
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isArabic = pathname === "/ar" || pathname.startsWith("/ar/");

    // Always overwrite the header so a visitor can't send their own value
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-byan-lang", isArabic ? "ar" : "en");

    if (isArabic) {
        const url = request.nextUrl.clone();
        url.pathname = pathname.slice(3) || "/";
        return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
    // Skip API routes, Next.js internals and files with an extension (sitemap.xml, robots.txt, images)
    matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
