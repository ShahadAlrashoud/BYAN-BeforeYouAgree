// All visible strings for the /popular page. English (en) and Arabic (ar).
// Wording rule: neutral and factual. Never "popular", "most trusted" or "best". A count says nothing about trust.
// [AR review pending] every Arabic string in this file must be approved by a native speaker.
// The risk level names reuse the Arabic labels already live on the How It Works page.
export const popularStrings = {
    en: {
        metaTitle: "Websites analyzed at least 5 times | BYAN",
        metaDescription: "Websites whose policies were analyzed at least 5 times in the last 30 days.",
        title: "Websites analyzed at least 5 times",
        intro: "These websites were analyzed at least 5 times in the last 30 days, listed by number of analyses. A higher count does not mean a website is more or less trustworthy.",
        disclaimer: "Results may not reflect the current policy. Re-run the analysis for the latest version.",
        empty: "No analyses have reached the threshold yet.",
        unavailable: "This list could not be loaded right now. Please try again later.",
        analyzedTimes: (n: number) => `analyzed ${n} times`,
        score: "Risk score",
        lastAnalyzed: "Last analyzed",
        view: "View result",
        levels: { safe: "Safe", moderate: "Moderate Risk", high: "High Risk" },
    },
    ar: {
        // [AR review pending]
        metaTitle: "مواقع تم تحليلها 5 مرات على الأقل | بيان",
        metaDescription: "مواقع تم تحليل سياساتها 5 مرات على الأقل خلال آخر 30 يومًا.",
        title: "مواقع تم تحليلها 5 مرات على الأقل",
        intro: "هذه المواقع تم تحليلها 5 مرات على الأقل خلال آخر 30 يومًا، وهي مرتبة حسب عدد التحليلات. ارتفاع العدد لا يعني أن الموقع أكثر أو أقل موثوقية.",
        disclaimer: "قد لا تعكس النتائج السياسة الحالية. أعد تشغيل التحليل للحصول على أحدث نسخة.",
        empty: "لم تصل أي تحليلات إلى الحد الأدنى بعد.",
        unavailable: "تعذر تحميل هذه القائمة الآن. يرجى المحاولة لاحقًا.",
        analyzedTimes: (n: number) => `تم تحليله ${n} مرات`,
        score: "درجة المخاطر",
        lastAnalyzed: "آخر تحليل",
        view: "عرض النتيجة",
        levels: { safe: "آمن", moderate: "متوسط الخطورة", high: "عالي الخطورة" },
    },
} as const;
