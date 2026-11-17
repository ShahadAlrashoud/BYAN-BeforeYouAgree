// Keyword-based fallback detector.
// Returns the REAL sentence from the policy (copied word for word) as `text`, so it passes evidence validation.

const MAX_QUOTE_CHARS = 400;
const MIN_QUOTE_WORDS = 6;

const RULES = [
    {
        key: "collect",
        category: { en: "Data Collection", ar: "جمع البيانات" },
        riskWeight: 15,
        severity: "medium",
        patterns: [/\bcollect\w*/i, /نجمع|نقوم بجمع|يتم جمع|جمع (?:ال)?(?:بيانات|معلومات)/],
        plainExplanation: {
            en: "The company says it collects information about you.",
            ar: "تذكر الشركة أنها تجمع معلومات عنك."
        },
        riskReason: {
            en: "The more data a service collects, the more can be exposed or misused.",
            ar: "كلما زادت البيانات التي تجمعها الخدمة، زاد ما قد يتعرض للتسريب أو سوء الاستخدام."
        },
        suggestedAction: {
            en: "Check which data types are listed and turn off optional data collection in your settings.",
            ar: "راجع أنواع البيانات المذكورة وأوقف جمع البيانات الاختيارية من الإعدادات."
        }
    },
    {
        key: "third parties",
        category: { en: "Third-Party Sharing", ar: "المشاركة مع أطراف ثالثة" },
        riskWeight: 30,
        severity: "high",
        patterns: [
            /\bthird[\s-]part(?:y|ies)\b/i,
            /طرف (?:ال)?ثالث|[أا]طراف (?:ال)?ثالث|جهات? خارجي|[أا]طراف خارجي/
        ],
        plainExplanation: {
            en: "Your information may be shared with other companies.",
            ar: "قد تتم مشاركة معلوماتك مع شركات أخرى."
        },
        riskReason: {
            en: "Once data leaves the company, you have less control over how it is used or protected.",
            ar: "عندما تخرج البيانات من الشركة، تقل سيطرتك على طريقة استخدامها وحمايتها."
        },
        suggestedAction: {
            en: "Ask the company: which third parties receive my data, and for what purpose?",
            ar: "اسأل الشركة: ما الجهات الخارجية التي تستلم بياناتي، ولأي غرض؟"
        }
    },
    {
        key: "retain",
        category: { en: "Data Retention", ar: "الاحتفاظ بالبيانات" },
        riskWeight: 20,
        severity: "high",
        patterns: [/\bretain\w*|\bretention\b/i, /نحتفظ|يحتفظ|تحتفظ|ال[اإ]حتفاظ/],
        plainExplanation: {
            en: "The company keeps your data for a period of time.",
            ar: "تحتفظ الشركة ببياناتك لفترة من الزمن."
        },
        riskReason: {
            en: "Long or unclear retention increases the risk of your data being exposed later.",
            ar: "الاحتفاظ الطويل أو غير الواضح يزيد خطر تعرض بياناتك لاحقًا."
        },
        suggestedAction: {
            en: "Ask the company: how long is my data kept, and can I request deletion?",
            ar: "اسأل الشركة: كم مدة الاحتفاظ ببياناتي، وهل يمكنني طلب حذفها؟"
        }
    },
    {
        key: "without notice",
        category: { en: "User Rights Limitation", ar: "تقييد حقوق المستخدم" },
        riskWeight: 25,
        severity: "high",
        patterns: [
            /\bwithout (?:prior |advance |any )?notice\b/i,
            /(?:دون|بدون|من غير) (?:سابق )?(?:[إا]شعار|[إا]خطار)/
        ],
        plainExplanation: {
            en: "The company can make changes without telling you first.",
            ar: "يمكن للشركة إجراء تغييرات دون إبلاغك مسبقًا."
        },
        riskReason: {
            en: "You may not find out when terms that affect your data change.",
            ar: "قد لا تعلم بتغيّر الشروط التي تؤثر على بياناتك."
        },
        suggestedAction: {
            en: "Review the policy regularly and ask: will I be notified of changes by email?",
            ar: "راجع السياسة بشكل دوري واسأل الشركة: هل سيتم إشعاري بالتغييرات عبر البريد الإلكتروني؟"
        }
    }
];

function detectLang(text) {
    const arabic = (text.match(/[\u0600-\u06FF]/g) || []).length;
    return arabic / Math.max(text.length, 1) > 0.08 ? "ar" : "en";
}

// Splits into sentences while keeping exact offsets in the original text
function splitSentences(text) {
    const out = [];
    const re = /[^.!?؟؛\n]+[.!?؟؛]*/g;
    let m;
    while ((m = re.exec(text)) !== null) {
        const raw = m[0];
        const lead = raw.length - raw.trimStart().length;
        const s = raw.trim();
        if (s) out.push({ start: m.index + lead, end: m.index + lead + s.length });
    }
    return out;
}

const wordCount = (s) => s.split(/\s+/).filter(Boolean).length;

// Cuts a long span down to a window around the keyword, on word boundaries (still word for word)
function windowAround(text, start, end, hitPos) {
    let s = Math.max(start, hitPos - 180);
    let e = Math.min(end, s + MAX_QUOTE_CHARS);
    if (s > start) {
        const sp = text.indexOf(" ", s);
        if (sp !== -1 && sp < e) s = sp + 1;
    }
    if (e < end) {
        const sp = text.lastIndexOf(" ", e);
        if (sp > s) e = sp;
    }
    return text.slice(s, e).trim();
}

function findQuote(text, sentences, patterns) {
    for (let i = 0; i < sentences.length; i++) {
        const sent = sentences[i];
        const sentText = text.slice(sent.start, sent.end);

        for (const re of patterns) {
            const hit = re.exec(sentText);
            if (!hit) continue;

            // If the sentence is too short to be useful evidence, extend it with the following sentences
            let endIdx = i;
            while (
                endIdx + 1 < sentences.length &&
                wordCount(text.slice(sent.start, sentences[endIdx].end)) < MIN_QUOTE_WORDS
            ) {
                endIdx++;
            }

            const spanEnd = sentences[endIdx].end;
            const hitPos = sent.start + hit.index;

            return spanEnd - sent.start > MAX_QUOTE_CHARS
                ? windowAround(text, sent.start, spanEnd, hitPos)
                : text.slice(sent.start, spanEnd).trim();
        }
    }
    return null;
}

export function detectRiskClauses(text) {
    const source = String(text || "");
    const lang = detectLang(source);
    const sentences = splitSentences(source);
    const matches = [];

    for (const rule of RULES) {
        const quote = findQuote(source, sentences, rule.patterns);
        if (!quote) continue;

        matches.push({
            text: quote, // copied word for word from the policy
            category: rule.category[lang],
            riskWeight: rule.riskWeight,
            severity: rule.severity,
            plainExplanation: rule.plainExplanation[lang],
            riskReason: rule.riskReason[lang],
            suggestedAction: rule.suggestedAction[lang],
            pdplFlag: rule.key === "third parties"
        });
    }

    return matches;
}