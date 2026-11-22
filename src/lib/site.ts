// Site-wide constants shared by metadata, the sitemap, robots and structured data.
// Pure values only (no server or client APIs), so any file can import this.
export const SITE_URL = "https://www.byan.website";

// Default share image: the BYAN logo (public/BYAN-logo.png, 752x752).
export const LOGO_PATH = "/BYAN-logo.png";
export const OG_IMAGE = {
    url: LOGO_PATH,
    width: 752,
    height: 752,
    alt: "BYAN logo",
};
