// User-facing messages for busy / limited responses, in English and Arabic.
// Every Arabic string below is [AR review pending]: a native speaker must approve it.

const MESSAGES = {
    // The AI provider kept answering "too many requests"
    busy: {
        en: "The AI service is busy right now. Please wait a minute and try again.",
        ar: "خدمة الذكاء الاصطناعي مشغولة حاليًا. يرجى الانتظار دقيقة ثم المحاولة مرة أخرى.", // [AR review pending]
    },
    // The daily token budget is used up
    budget: {
        en: "We have reached today's limit for new analyses. Please try again tomorrow. Results that were analyzed before can still be opened.",
        ar: "وصلنا إلى الحد اليومي للتحليلات الجديدة. يرجى المحاولة غدًا. ما زال بإمكانك فتح النتائج التي تم تحليلها سابقًا.", // [AR review pending]
    },
    // The AI failed for another reason and the keyword fallback is switched off
    unavailable: {
        en: "AI analysis is unavailable right now. Please try again in a moment.",
        ar: "تحليل الذكاء الاصطناعي غير متاح حاليًا. يرجى المحاولة بعد قليل.", // [AR review pending]
    },
    // Per-IP limit on analyses
    ip_limit: {
        en: "You are sending requests too quickly. Please wait a moment and try again.",
        ar: "ترسل الطلبات بسرعة كبيرة. يرجى الانتظار قليلًا ثم المحاولة مرة أخرى.", // [AR review pending]
    },
    // Translate: per-IP limit
    translate_ip: {
        en: "Too many translation requests. Please wait a minute and try again.",
        ar: "طلبات ترجمة كثيرة. يرجى الانتظار دقيقة ثم المحاولة مرة أخرى.", // [AR review pending]
    },
    // Translate: daily limit
    translate_daily: {
        en: "Translation is unavailable for the rest of today. Please try again tomorrow.",
        ar: "الترجمة غير متاحة لبقية اليوم. يرجى المحاولة غدًا.", // [AR review pending]
    },
};

export function aiMessage(code, lang) {
    const entry = MESSAGES[code] || MESSAGES.unavailable;
    return lang === "ar" ? entry.ar : entry.en;
}
