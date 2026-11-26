"use client";

import type { CSSProperties } from "react";
import Link from "@/app/components/LocalizedLink";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { useTheme } from "../providers";

const plex = IBM_Plex_Sans_Arabic({
    subsets: ["arabic", "latin"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
});

// Verify this points to the exact PDPL page you want to reference.
const PDPL_SOURCE_URL = "https://sdaia.gov.sa";

type Person = {
    name: string;
    role: string;
    linkedin: string;
};

type Item = {
    title: string;
    text: string;
};

type RiskLevel = {
    label: string;
    text: string;
};

type Content = {
    tagline: string;
    strategy: string;
    heroPoints: string[];
    backLink: string;
    analyzeCta: string;
    closingCta: string;
    howLink: string;
    howFullLink: string;
    privacyLink: string;
    contactLink: string;
    linkedinLabel: string;
    lead: string;
    changes: string;

    problemTitle: string;
    problemIntro: string;
    problemDimensions: Item[];

    aboutTitle: string;
    about: string;
    capabilities: Item[];

    howTitle: string;
    howIntro: string;
    howSteps: Item[];

    missionTitle: string;
    mission: string;
    visionTitle: string;
    vision: string;

    approachTitle: string;
    approachIntro: string;
    principles: Item[];

    pdplTitle: string;
    pdplIntro: string;
    pdplPrinciples: Item[];
    pdplDisclaimer: string;
    pdplSourceLabel: string;

    resultsTitle: string;
    resultsIntro: string;
    riskLevels: RiskLevel[];
    resultsPoints: string[];
    calloutTitle: string;
    limitations: string;
    partialNote: string;

    dataText: string;
    feedbackText: string;
    feedbackLink: string;

    teamTitle: string;
    teamSub: string;

    closingTitle: string;
    closingText: string;

    team: Person[];
};

const content: Record<"en" | "ar", Content> = {
    en: {
        tagline: "Before You Agree",
        strategy: "Understand the finding. Verify the source. Decide for yourself.",
        heroPoints: [
            "AI-assisted policy analysis",
            "Original clauses beside explanations",
            "Arabic and English support",
        ],
        backLink: "← Back to homepage",
        analyzeCta: "Analyze a policy",
        closingCta: "Start your analysis",
        howLink: "Learn how BYAN works",
        howFullLink: "See the full methodology",
        privacyLink: "Read BYAN's Privacy Policy",
        contactLink: "Contact us",
        linkedinLabel: "LinkedIn",
        lead:
            "Every day, people accept Terms of Service and Privacy Policies without fully understanding what they say. These documents can be lengthy, technical, and difficult to navigate.",
        changes:
            "BYAN turns lengthy policies into clear findings, so you can see how your personal data may be collected, used, stored, and shared.",

        problemTitle: "Why BYAN exists",
        problemIntro:
            "The challenge is not simply that privacy policies are long. Important details about personal data are hard to find, compare, and understand, especially when they are written in legal or technical language.",
        problemDimensions: [
            {
                title: "Accessibility",
                text: "Policies are lengthy and difficult to navigate.",
            },
            {
                title: "Comprehension",
                text: "Legal terminology makes important conditions difficult to understand.",
            },
            {
                title: "Awareness",
                text: "Users may not recognize how their personal information is collected, processed, or shared.",
            },
        ],

        aboutTitle: "What BYAN does",
        about:
            "BYAN (Before You Agree) is a bilingual platform that helps people review digital agreements, particularly Terms of Service and Privacy Policies. It uses AI to organize policy content into findings that you can check against the original text.",
        capabilities: [
            {
                title: "Policy analysis",
                text: "Analyze Privacy Policies and Terms of Service through supported input methods.",
            },
            {
                title: "Privacy findings",
                text: "Identify privacy practices, concerns, and disclosures that may deserve your attention.",
            },
            {
                title: "Source-based explanations",
                text: "Connect findings to the original policy text so you can verify them yourself.",
            },
            {
                title: "Bilingual experience",
                text: "Read policy information in Arabic or English.",
            },
        ],

        howTitle: "How BYAN works",
        howIntro: "Four steps from policy text to an informed decision.",
        howSteps: [
            {
                title: "Submit a policy",
                text: "Paste the text or use a supported input method.",
            },
            {
                title: "Analyze",
                text: "BYAN summarizes the text and flags privacy-related points.",
            },
            {
                title: "Verify",
                text: "Review the clause each finding refers to in the original wording.",
            },
            {
                title: "Decide",
                text: "Use the results as a starting point, then make your own judgment.",
            },
        ],

        missionTitle: "Our mission",
        mission:
            "Make complex digital agreements easier to understand through accessible, transparent, and source-based privacy analysis.",
        visionTitle: "Our vision",
        vision:
            "A digital environment where individuals can make more informed decisions about their personal data and the online services they use.",

        approachTitle: "Principles behind BYAN",
        approachIntro:
            "BYAN is built around a simple idea: people should be able to understand the terms they are asked to accept, and check the reasoning behind any finding.",
        principles: [
            {
                title: "Clarity",
                text: "Say what the policy means, not just what it says, in plain language.",
            },
            {
                title: "Transparency",
                text: "Findings are designed to reference the relevant policy text, so you can examine the original wording and the reasoning behind each observation.",
            },
            {
                title: "Accessibility",
                text: "Support both Arabic and English so more people can engage with digital agreements in the language they understand best.",
            },
            {
                title: "User empowerment",
                text: "Help you ask better questions and make more informed decisions, rather than deciding for you.",
            },
        ],

        pdplTitle: "A Saudi privacy context",
        pdplIntro:
            "When reviewing privacy-related disclosures, BYAN considers selected principles of Saudi Arabia's Personal Data Protection Law (PDPL). The analysis highlights relevant policy statements for further examination. It does not independently determine legal compliance.",
        pdplPrinciples: [
            {
                title: "Consent",
                text: "Whether the policy explains what the user is agreeing to.",
            },
            {
                title: "Purpose limitation",
                text: "Whether data is used only for the purposes the policy states.",
            },
            {
                title: "Data minimization",
                text: "Whether the amount of data collected appears proportionate to the service.",
            },
            {
                title: "Retention",
                text: "How long data is kept and when it is deleted.",
            },
            {
                title: "Data subject rights",
                text: "Whether the policy describes how users can access, correct, or delete their data.",
            },
            {
                title: "Cross-border transfers",
                text: "Whether data is shared or stored outside the Kingdom.",
            },
        ],
        pdplDisclaimer:
            "A highlighted practice is not automatically a violation. BYAN is an informational tool, not an official PDPL assessment, legal opinion, or certification of compliance.",
        pdplSourceLabel: "Read the PDPL on the official SDAIA website",

        resultsTitle: "Understanding the results",
        resultsIntro:
            "BYAN uses AI to summarize policy text and flag potential privacy-related findings. Treat the output as a starting point for review, not a replacement for reading the terms or seeking qualified advice.",
        riskLevels: [
            {
                label: "Low risk",
                text: "No significant concerns were flagged in the analyzed text. This does not mean the policy is free of privacy concerns or compliant with applicable law.",
            },
            {
                label: "Moderate risk",
                text: "Some findings deserve closer examination.",
            },
            {
                label: "High risk",
                text: "Potentially significant privacy concerns were flagged for review.",
            },
        ],
        resultsPoints: [
            "Risk levels help you prioritize what to review. They are not a final judgment on a company, service, or policy.",
            "Before drawing a conclusion, read the clause a finding refers to and the context around it.",
            "Summaries and findings may omit context, misread wording, or contain errors.",
            "BYAN processes the policy text it can retrieve or that you provide.",
        ],
        calloutTitle: "Limits of the analysis",
        limitations:
            "No automated analysis can guarantee that every relevant clause was found or interpreted correctly. A low-risk result does not mean a policy is risk-free, fair, or legally compliant. BYAN does not provide legal advice and does not make decisions on your behalf. Policies change, so check the original service policy for the latest wording.",
        partialNote:
            "Partial analysis: if BYAN analyzed only part of a document, the result is not a complete review.",

        dataText:
            "Submitted policy text is used to produce your analysis. To learn how it is stored, retained, and shared, read our Privacy Policy.",
        feedbackText: "Found a result that looks wrong?",
        feedbackLink: "Report an incorrect result",

        teamTitle: "The BYAN team",
        teamSub:
            "BYAN was developed as a university graduation project by a student team, with a shared interest in making digital privacy information easier to understand.",

        closingTitle: "Before you agree, understand first.",
        closingText:
            "Start by reviewing a Privacy Policy or Terms of Service, and make your decision with a clearer understanding.",

        team: [
            { name: "Shahad Alrashoud", role: "", linkedin: "" },
            { name: "Ghadah Almutairi", role: "", linkedin: "" },
            { name: "Nourah Almudbil", role: "", linkedin: "" },
        ],
    },

    ar: {
        tagline: "قبل أن توافق",
        strategy: "افهم النتيجة. تحقق من المصدر. قرّر بنفسك.",
        heroPoints: [
            "تحليل للسياسات بمساعدة الذكاء الاصطناعي",
            "نص البند الأصلي بجانب الشرح",
            "دعم العربية والإنجليزية",
        ],
        backLink: "→ العودة إلى الصفحة الرئيسية",
        analyzeCta: "حلّل سياسة",
        closingCta: "ابدأ التحليل",
        howLink: "تعرّف على كيفية عمل بيان",
        howFullLink: "اطلع على شرح المنهجية كاملًا",
        privacyLink: "اقرأ سياسة خصوصية بيان",
        contactLink: "تواصل معنا",
        linkedinLabel: "LinkedIn",
        lead:
            "يوافق الكثيرون يوميًا على شروط الخدمة وسياسات الخصوصية دون فهم كامل لما تتضمنه. فقد تكون هذه الوثائق طويلة ومليئة بالمصطلحات القانونية والتقنية التي يصعب استيعابها.",
        changes:
            "يحوّل بيان السياسات الطويلة إلى نتائج واضحة، لتعرف كيف قد تُجمع بياناتك الشخصية وتُستخدم وتُحفظ وتُشارك.",

        problemTitle: "لماذا وُجد بيان؟",
        problemIntro:
            "لا تكمن المشكلة في طول سياسات الخصوصية فحسب؛ بل يصعب العثور على المعلومات المهمة المتعلقة بالبيانات الشخصية ومقارنتها وفهمها، خصوصًا عندما تُكتب بلغة قانونية أو تقنية معقدة.",
        problemDimensions: [
            {
                title: "الوصول",
                text: "السياسات طويلة ويصعب التنقل بين أجزائها.",
            },
            {
                title: "الفهم",
                text: "المصطلحات القانونية تجعل الشروط المهمة صعبة الاستيعاب.",
            },
            {
                title: "الوعي",
                text: "قد لا يدرك المستخدم كيف تُجمع معلوماته الشخصية أو تُعالج أو تُشارك.",
            },
        ],

        aboutTitle: "ماذا يفعل بيان؟",
        about:
            "بيان (قبل أن توافق) منصة ثنائية اللغة تساعد المستخدمين على مراجعة الاتفاقيات الرقمية، وخاصة شروط الخدمة وسياسات الخصوصية. ويستخدم الذكاء الاصطناعي لتنظيم محتوى السياسات في نتائج يمكنك التحقق منها بالرجوع إلى النص الأصلي.",
        capabilities: [
            {
                title: "تحليل السياسات",
                text: "تحليل سياسات الخصوصية وشروط الخدمة عبر طرق الإدخال المدعومة.",
            },
            {
                title: "ملاحظات الخصوصية",
                text: "رصد ممارسات وملاحظات وإفصاحات متعلقة بالخصوصية قد تستحق انتباهك.",
            },
            {
                title: "شروح مرتبطة بالمصدر",
                text: "ربط النتائج بنص السياسة الأصلي لتتمكن من التحقق منها بنفسك.",
            },
            {
                title: "تجربة ثنائية اللغة",
                text: "قراءة معلومات السياسات بالعربية أو الإنجليزية.",
            },
        ],

        howTitle: "كيف يعمل بيان؟",
        howIntro: "أربع خطوات من نص السياسة إلى قرار واعٍ.",
        howSteps: [
            {
                title: "أدخل السياسة",
                text: "الصق النص أو استخدم طريقة إدخال مدعومة.",
            },
            {
                title: "التحليل",
                text: "يلخص بيان النص ويرصد النقاط المتعلقة بالخصوصية.",
            },
            {
                title: "التحقق",
                text: "راجع البند الذي تشير إليه كل نتيجة في صياغته الأصلية.",
            },
            {
                title: "القرار",
                text: "استخدم النتائج نقطة انطلاق، ثم اتخذ قرارك بنفسك.",
            },
        ],

        missionTitle: "رسالتنا",
        mission:
            "تبسيط الاتفاقيات الرقمية المعقدة عبر تحليل خصوصية ميسّر وشفاف ومرتبط بالنص الأصلي.",
        visionTitle: "رؤيتنا",
        vision:
            "بيئة رقمية يتخذ فيها الأفراد قرارات أكثر وعيًا بشأن بياناتهم الشخصية والخدمات الإلكترونية التي يستخدمونها.",

        approachTitle: "المبادئ التي يقوم عليها بيان",
        approachIntro:
            "ينطلق بيان من فكرة بسيطة: من حق المستخدم أن يفهم الشروط المطلوب منه قبولها، وأن يتحقق من الأساس الذي تقوم عليه أي نتيجة.",
        principles: [
            {
                title: "الوضوح",
                text: "شرح ما تعنيه السياسة، لا مجرد ما تقوله، بلغة مبسطة.",
            },
            {
                title: "الشفافية",
                text: "صُممت النتائج للإشارة إلى نص السياسة ذي الصلة، لتتمكن من فحص الصياغة الأصلية وفهم أساس كل ملاحظة.",
            },
            {
                title: "إمكانية الوصول",
                text: "دعم اللغتين العربية والإنجليزية لتمكين عدد أكبر من المستخدمين من فهم الاتفاقيات الرقمية باللغة الأنسب لهم.",
            },
            {
                title: "تمكين المستخدم",
                text: "مساعدتك على طرح أسئلة أفضل واتخاذ قرارات أكثر وعيًا، دون اتخاذ القرار نيابةً عنك.",
            },
        ],

        pdplTitle: "في سياق حماية البيانات السعودي",
        pdplIntro:
            "يأخذ بيان في الاعتبار مبادئ مختارة من نظام حماية البيانات الشخصية السعودي (PDPL) عند مراجعة الإفصاحات المتعلقة بالخصوصية. ويبرز التحليل العبارات ذات الصلة لمزيد من الفحص، ولا يحدد بشكل مستقل مدى الامتثال القانوني.",
        pdplPrinciples: [
            {
                title: "الموافقة",
                text: "هل توضح السياسة ما يوافق عليه المستخدم؟",
            },
            {
                title: "تحديد الغرض",
                text: "هل تُستخدم البيانات للأغراض المعلنة فقط؟",
            },
            {
                title: "تقليل البيانات",
                text: "هل يبدو حجم البيانات المجموعة متناسبًا مع الخدمة؟",
            },
            {
                title: "مدة الاحتفاظ",
                text: "كم تُحفظ البيانات، ومتى تُحذف؟",
            },
            {
                title: "حقوق صاحب البيانات",
                text: "هل تصف السياسة طرق الاطلاع على البيانات وتصحيحها وحذفها؟",
            },
            {
                title: "نقل البيانات خارج المملكة",
                text: "هل تُشارك البيانات أو تُخزَّن خارج المملكة؟",
            },
        ],
        pdplDisclaimer:
            "الممارسة المُبرزة ليست مخالفة بالضرورة. بيان أداة معلوماتية، ولا تُعد نتائجه تقييمًا رسميًا للامتثال للنظام أو رأيًا قانونيًا أو شهادة امتثال.",
        pdplSourceLabel:
            "اطلع على النظام في موقع الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا)",

        resultsTitle: "فهم النتائج",
        resultsIntro:
            "يستخدم بيان الذكاء الاصطناعي لتلخيص نصوص السياسات ورصد مؤشرات محتملة تتعلق بالخصوصية. اعتبر النتائج نقطة بداية للمراجعة، وليست بديلًا عن قراءة الشروط أو طلب المشورة من مختص.",
        riskLevels: [
            {
                label: "مخاطر منخفضة",
                text: "لم تُرصد ملاحظات جوهرية في النص المحلَّل. ولا يعني ذلك أن السياسة خالية من مخاوف الخصوصية أو متوافقة مع الأنظمة المعمول بها.",
            },
            {
                label: "مخاطر متوسطة",
                text: "بعض النتائج تستحق مراجعة أدق.",
            },
            {
                label: "مخاطر مرتفعة",
                text: "رُصدت مخاوف قد تكون جوهرية على صعيد الخصوصية وتستحق المراجعة.",
            },
        ],
        resultsPoints: [
            "مستويات المخاطر تساعدك على تحديد أولويات المراجعة، ولا تمثل حكمًا نهائيًا على شركة أو خدمة أو سياسة.",
            "قبل استخلاص أي استنتاج، اقرأ البند الذي تشير إليه النتيجة والسياق المحيط به.",
            "قد تُغفل الملخصات والنتائج بعض السياق، أو تسيء فهم الصياغة، أو تتضمن أخطاء.",
            "تعالج المنصة نص السياسة الذي تستطيع الوصول إليه أو الذي تقدمه أنت.",
        ],
        calloutTitle: "حدود التحليل",
        limitations:
            "لا يمكن لأي تحليل آلي ضمان العثور على كل بند ذي صلة أو تفسيره تفسيرًا صحيحًا. ولا تعني نتيجة المخاطر المنخفضة أن السياسة خالية من المخاطر أو عادلة أو متوافقة قانونيًا. ولا يقدم بيان استشارات قانونية، ولا يتخذ القرارات نيابةً عنك. وقد تتغير السياسات، لذا راجع النص الأصلي لدى الخدمة للاطلاع على أحدث صياغة.",
        partialNote:
            "تحليل جزئي: إذا حلّل بيان جزءًا فقط من الوثيقة، فلا تُعد النتيجة مراجعة كاملة لها.",

        dataText:
            "يُستخدم نص السياسة الذي تقدمه لإنشاء التحليل. لمعرفة طريقة حفظه ومدة الاحتفاظ به ومشاركته، اطلع على سياسة الخصوصية.",
        feedbackText: "لاحظت نتيجة تبدو غير صحيحة؟",
        feedbackLink: "أبلغ عن نتيجة غير صحيحة",

        teamTitle: "فريق بيان",
        teamSub:
            "طُوّر بيان مشروع تخرج جامعيًا على يد فريق طلابي، يجمعه اهتمام مشترك بجعل معلومات الخصوصية الرقمية أسهل فهمًا.",

        closingTitle: "قبل أن توافق، افهم أولًا.",
        closingText:
            "ابدأ بمراجعة سياسة الخصوصية أو شروط الخدمة، واتخذ قرارك بناءً على فهم أوضح.",

        team: [
            { name: "شهد الرشود", role: "", linkedin: "" },
            { name: "غادة المطيري", role: "", linkedin: "" },
            { name: "نورة المدبل", role: "", linkedin: "" },
        ],
    },
};

function LinkedInIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}

function WarningIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );
}

export default function AboutPage() {
    const { theme, lang, colors: themeColors } = useTheme();
    const isDark = theme === "dark";
    const isAr = lang === "ar";
    const t = content[isAr ? "ar" : "en"];
    const align = isAr ? "right" : "left";
    const accent = themeColors.accent;

    const colors = {
        heading: isDark ? "#f1f5f9" : "#0f172a",
        body: isDark ? "#aab6c7" : "#5b6578",
        lead: isDark ? "#e2e8f0" : "#334155",
        soft: themeColors.accentSoft,
        softBorder: `color-mix(in srgb, ${accent} ${isDark ? 40 : 25}%, transparent)`,
        glow: `color-mix(in srgb, ${accent} ${isDark ? 22 : 14}%, transparent)`,
        card: isDark ? "rgba(255, 255, 255, 0.035)" : "#ffffff",
        cardBorder: isDark ? "rgba(148, 163, 184, 0.16)" : "#e6eaf2",
        shadow: isDark
            ? "0 8px 30px rgba(0, 0, 0, 0.35)"
            : "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06)",
        pageBg: isDark
            ? "linear-gradient(180deg, #0a0e1a 0%, #0f1628 100%)"
            : "linear-gradient(180deg, #ffffff 0%, #f7f8fc 100%)",
        warnBg: isDark ? "rgba(245, 158, 11, 0.08)" : "#fffbeb",
        warnBorder: isDark ? "rgba(245, 158, 11, 0.28)" : "#fde68a",
        warnTitle: isDark ? "#fcd34d" : "#92400e",
        warnText: isDark ? "#fde68a" : "#78350f",
    };

    const card: CSSProperties = {
        background: colors.card,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: 18,
        boxShadow: colors.shadow,
    };

    const accentGradient = `linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 60%, #000))`;

    const container: CSSProperties = {
        width: "100%",
        maxWidth: 960,
        margin: "0 auto",
        padding: "0 24px 96px",
        boxSizing: "border-box",
    };

    const sectionStyle: CSSProperties = {
        marginTop: 96,
    };

    const paragraphStyle: CSSProperties = {
        margin: 0,
        color: colors.body,
        fontSize: "1rem",
        lineHeight: 1.95,
        textAlign: align,
    };

    const linkStyle: CSSProperties = {
        color: themeColors.accentText,
        fontWeight: 600,
        textDecoration: "none",
    };

    const ctaBase: CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        fontWeight: 700,
        textDecoration: "none",
    };

    const numberBadge = (n: number) => (
        <div
            aria-hidden="true"
            style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: accentGradient,
                color: themeColors.onAccent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                marginBottom: 16,
            }}
        >
            {isAr ? n.toLocaleString("ar-SA") : n}
        </div>
    );

    const sectionHeading = (id: string, text: string, center = false) => (
        <>
            <span
                aria-hidden="true"
                style={{
                    display: "block",
                    width: 40,
                    height: 4,
                    borderRadius: 4,
                    background: accent,
                    margin: center ? "0 auto 18px" : "0 0 18px",
                }}
            />
            <h2
                id={id}
                style={{
                    margin: "0 0 18px",
                    color: colors.heading,
                    fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
                    fontWeight: 700,
                    lineHeight: 1.35,
                    textAlign: center ? "center" : align,
                }}
            >
                {text}
            </h2>
        </>
    );

    const renderPerson = (person: Person) => (
        <article
            key={person.name}
            style={{
                ...card,
                padding: "32px 20px 28px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
            }}
        >
            <div
                aria-hidden="true"
                style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: accentGradient,
                    color: themeColors.onAccent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.7rem",
                    fontWeight: 700,
                    marginBottom: 10,
                    boxShadow: `0 0 0 6px ${colors.soft}`,
                }}
            >
                {person.name.charAt(0)}
            </div>

            <h3
                style={{
                    margin: 0,
                    color: colors.heading,
                    fontSize: "1.08rem",
                    fontWeight: 700,
                    lineHeight: 1.5,
                }}
            >
                {person.name}
            </h3>

            {person.role && (
                <p style={{ margin: 0, color: colors.body, fontSize: "0.92rem" }}>
                    {person.role}
                </p>
            )}

            {person.linkedin && (
                <a
                    href={person.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        marginTop: 6,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        ...linkStyle,
                        fontSize: "0.9rem",
                    }}
                >
                    <LinkedInIcon />
                    {t.linkedinLabel}
                </a>
            )}
        </article>
    );

    return (
        <main
            dir={isAr ? "rtl" : "ltr"}
            className={plex.className}
            style={{
                minHeight: "100vh",
                background: colors.pageBg,
                overflowX: "hidden",
            }}
        >
            {/* Hero */}
            <header
                style={{
                    position: "relative",
                    overflow: "hidden",
                    textAlign: "center",
                    padding: "88px 24px 72px",
                }}
            >
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: `radial-gradient(ellipse 55% 60% at 50% 0%, ${colors.glow}, transparent 70%)`,
                        pointerEvents: "none",
                    }}
                />

                <div style={{ position: "relative" }}>
                    <img
                        src="/BYAN-logo.png"
                        alt="BYAN"
                        width={96}
                        height={96}
                        style={{
                            width: 96,
                            height: 96,
                            objectFit: "contain",
                            margin: "0 auto 20px",
                            display: "block",
                        }}
                    />

                    <h1
                        style={{
                            margin: "0 0 14px",
                            color: colors.heading,
                            fontSize: "clamp(2.6rem, 7vw, 3.8rem)",
                            fontWeight: 800,
                            letterSpacing: isAr ? 0 : "0.05em",
                            lineHeight: 1.1,
                        }}
                    >
                        BYAN
                    </h1>

                    <p
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            margin: 0,
                            padding: "7px 16px",
                            borderRadius: 999,
                            border: `1px solid ${colors.softBorder}`,
                            background: colors.soft,
                            color: themeColors.accentText,
                            fontSize: "0.92rem",
                            fontWeight: 600,
                        }}
                    >
                        <span
                            aria-hidden="true"
                            style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: accent,
                            }}
                        />
                        {t.tagline}
                    </p>

                    <p
                        style={{
                            maxWidth: 660,
                            margin: "30px auto 0",
                            color: colors.lead,
                            fontSize: "clamp(1.08rem, 2.5vw, 1.3rem)",
                            lineHeight: 1.9,
                            fontWeight: 500,
                        }}
                    >
                        {t.lead}
                    </p>

                    <p
                        style={{
                            maxWidth: 660,
                            margin: "14px auto 0",
                            color: themeColors.accentText,
                            fontSize: "clamp(1.08rem, 2.5vw, 1.3rem)",
                            fontWeight: 700,
                            lineHeight: 1.7,
                        }}
                    >
                        {t.changes}
                    </p>

                    <ul
                        style={{
                            listStyle: "none",
                            padding: 0,
                            margin: "26px 0 0",
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "center",
                            gap: 10,
                        }}
                    >
                        {t.heroPoints.map((point) => (
                            <li
                                key={point}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "8px 14px",
                                    borderRadius: 999,
                                    background: colors.card,
                                    border: `1px solid ${colors.cardBorder}`,
                                    color: colors.heading,
                                    fontSize: "0.9rem",
                                    fontWeight: 600,
                                }}
                            >
                                <span
                                    aria-hidden="true"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 18,
                                        height: 18,
                                        borderRadius: "50%",
                                        background: colors.soft,
                                        color: themeColors.accentText,
                                    }}
                                >
                                    <CheckIcon />
                                </span>
                                {point}
                            </li>
                        ))}
                    </ul>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            flexWrap: "wrap",
                            gap: 12,
                            marginTop: 34,
                        }}
                    >
                        <Link
                            href="/analyze"
                            style={{
                                ...ctaBase,
                                padding: "13px 24px",
                                background: accent,
                                color: themeColors.onAccent,
                                boxShadow: `0 10px 24px color-mix(in srgb, ${accent} 35%, transparent)`,
                            }}
                        >
                            {t.analyzeCta}
                        </Link>

                        <Link
                            href="/how-it-works"
                            style={{
                                ...ctaBase,
                                padding: "13px 24px",
                                border: `1px solid ${colors.softBorder}`,
                                color: themeColors.accentText,
                                background: colors.card,
                            }}
                        >
                            {t.howLink}
                        </Link>
                    </div>

                    <p
                        style={{
                            margin: "44px auto 0",
                            maxWidth: 600,
                            color: colors.heading,
                            fontSize: "1rem",
                            fontWeight: 700,
                            letterSpacing: isAr ? 0 : "0.02em",
                        }}
                    >
                        {t.strategy}
                    </p>
                </div>
            </header>

            <div style={container}>
                {/* The problem */}
                <section aria-labelledby="why-byan">
                    {sectionHeading("why-byan", t.problemTitle)}

                    <p style={{ ...paragraphStyle, maxWidth: 720 }}>{t.problemIntro}</p>

                    <ol
                        style={{
                            listStyle: "none",
                            padding: 0,
                            margin: "32px 0 0",
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
                            gap: 16,
                        }}
                    >
                        {t.problemDimensions.map((item, i) => (
                            <li
                                key={item.title}
                                style={{
                                    ...card,
                                    padding: "26px 22px",
                                    textAlign: align,
                                }}
                            >
                                <span
                                    aria-hidden="true"
                                    style={{
                                        display: "block",
                                        fontSize: "2.4rem",
                                        fontWeight: 800,
                                        lineHeight: 1,
                                        color: colors.softBorder,
                                        marginBottom: 14,
                                    }}
                                >
                                    {isAr ? (i + 1).toLocaleString("ar-SA") : `0${i + 1}`}
                                </span>
                                <h3
                                    style={{
                                        margin: "0 0 8px",
                                        color: colors.heading,
                                        fontSize: "1.05rem",
                                        fontWeight: 700,
                                    }}
                                >
                                    {item.title}
                                </h3>
                                <span
                                    style={{
                                        color: colors.body,
                                        fontSize: "0.96rem",
                                        lineHeight: 1.8,
                                    }}
                                >
                                    {item.text}
                                </span>
                            </li>
                        ))}
                    </ol>
                </section>

                {/* What BYAN does */}
                <section style={sectionStyle} aria-labelledby="about-byan">
                    {sectionHeading("about-byan", t.aboutTitle)}

                    <div
                        style={{
                            ...card,
                            padding: "28px 30px",
                            borderInlineStart: `4px solid ${accent}`,
                        }}
                    >
                        <p
                            style={{
                                ...paragraphStyle,
                                color: colors.lead,
                                fontSize: "1.04rem",
                            }}
                        >
                            {t.about}
                        </p>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(min(100%, 230px), 1fr))",
                            gap: 16,
                            marginTop: 24,
                        }}
                    >
                        {t.capabilities.map((item) => (
                            <article
                                key={item.title}
                                style={{
                                    ...card,
                                    padding: "22px 22px",
                                    textAlign: align,
                                }}
                            >
                                <h3
                                    style={{
                                        margin: "0 0 8px",
                                        color: colors.heading,
                                        fontSize: "1.02rem",
                                        fontWeight: 700,
                                    }}
                                >
                                    {item.title}
                                </h3>
                                <p style={{ ...paragraphStyle, fontSize: "0.94rem" }}>
                                    {item.text}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>

                {/* How BYAN works */}
                <section style={sectionStyle} aria-labelledby="how-byan">
                    {sectionHeading("how-byan", t.howTitle)}

                    <p style={{ ...paragraphStyle, maxWidth: 720 }}>{t.howIntro}</p>

                    <ol
                        style={{
                            listStyle: "none",
                            padding: 0,
                            margin: "32px 0 0",
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                            gap: 16,
                        }}
                    >
                        {t.howSteps.map((step, i) => (
                            <li
                                key={step.title}
                                style={{
                                    ...card,
                                    padding: "24px 22px",
                                    textAlign: align,
                                }}
                            >
                                {numberBadge(i + 1)}
                                <h3
                                    style={{
                                        margin: "0 0 8px",
                                        color: colors.heading,
                                        fontSize: "1.05rem",
                                        fontWeight: 700,
                                    }}
                                >
                                    {step.title}
                                </h3>
                                <p style={{ ...paragraphStyle, fontSize: "0.94rem" }}>
                                    {step.text}
                                </p>
                            </li>
                        ))}
                    </ol>

                    <div style={{ marginTop: 22, textAlign: align }}>
                        <Link href="/how-it-works" style={linkStyle}>
                            {t.howFullLink} →
                        </Link>
                    </div>
                </section>

                {/* Mission and vision */}
                <section style={sectionStyle} aria-label={t.missionTitle}>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                            gap: 16,
                        }}
                    >
                        <article
                            aria-labelledby="mission-title"
                            style={{
                                padding: "34px 28px",
                                borderRadius: 18,
                                background: accentGradient,
                                color: themeColors.onAccent,
                                boxShadow: `0 16px 40px color-mix(in srgb, ${accent} 30%, transparent)`,
                                textAlign: align,
                            }}
                        >
                            <h2
                                id="mission-title"
                                style={{
                                    margin: "0 0 14px",
                                    fontSize: "0.82rem",
                                    fontWeight: 700,
                                    letterSpacing: isAr ? 0 : "0.12em",
                                    textTransform: "uppercase",
                                    opacity: 0.85,
                                }}
                            >
                                {t.missionTitle}
                            </h2>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "1.12rem",
                                    lineHeight: 1.85,
                                    fontWeight: 600,
                                }}
                            >
                                {t.mission}
                            </p>
                        </article>

                        <article
                            aria-labelledby="vision-title"
                            style={{
                                ...card,
                                padding: "34px 28px",
                                textAlign: align,
                            }}
                        >
                            <h2
                                id="vision-title"
                                style={{
                                    margin: "0 0 14px",
                                    color: themeColors.accentText,
                                    fontSize: "0.82rem",
                                    fontWeight: 700,
                                    letterSpacing: isAr ? 0 : "0.12em",
                                    textTransform: "uppercase",
                                }}
                            >
                                {t.visionTitle}
                            </h2>
                            <p
                                style={{
                                    margin: 0,
                                    color: colors.heading,
                                    fontSize: "1.12rem",
                                    lineHeight: 1.85,
                                    fontWeight: 600,
                                }}
                            >
                                {t.vision}
                            </p>
                        </article>
                    </div>
                </section>

                {/* Principles */}
                <section style={sectionStyle} aria-labelledby="our-approach">
                    {sectionHeading("our-approach", t.approachTitle)}

                    <p style={{ ...paragraphStyle, maxWidth: 720 }}>{t.approachIntro}</p>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
                            gap: 16,
                            marginTop: 32,
                        }}
                    >
                        {t.principles.map((p, i) => (
                            <article
                                key={p.title}
                                style={{
                                    ...card,
                                    padding: "26px 24px",
                                    textAlign: align,
                                }}
                            >
                                {numberBadge(i + 1)}
                                <h3
                                    style={{
                                        margin: "0 0 8px",
                                        color: colors.heading,
                                        fontSize: "1.1rem",
                                        fontWeight: 700,
                                    }}
                                >
                                    {p.title}
                                </h3>
                                <p style={{ ...paragraphStyle, fontSize: "0.95rem" }}>
                                    {p.text}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Saudi PDPL context */}
                <section style={sectionStyle} aria-labelledby="pdpl-context">
                    {sectionHeading("pdpl-context", t.pdplTitle)}

                    <div
                        style={{
                            padding: "30px 26px",
                            borderRadius: 20,
                            background: colors.soft,
                            border: `1px solid ${colors.softBorder}`,
                        }}
                    >
                        <p
                            style={{
                                ...paragraphStyle,
                                color: colors.heading,
                                maxWidth: 760,
                            }}
                        >
                            {t.pdplIntro}
                        </p>

                        <ul
                            style={{
                                listStyle: "none",
                                padding: 0,
                                margin: "24px 0 0",
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
                                gap: 12,
                            }}
                        >
                            {t.pdplPrinciples.map((item) => (
                                <li
                                    key={item.title}
                                    style={{
                                        ...card,
                                        boxShadow: "none",
                                        padding: "16px 18px",
                                        display: "flex",
                                        gap: 12,
                                        alignItems: "flex-start",
                                        textAlign: align,
                                    }}
                                >
                                    <span
                                        aria-hidden="true"
                                        style={{
                                            flexShrink: 0,
                                            width: 24,
                                            height: 24,
                                            marginTop: 2,
                                            borderRadius: "50%",
                                            background: accent,
                                            color: themeColors.onAccent,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <CheckIcon />
                                    </span>
                                    <span
                                        style={{
                                            color: colors.body,
                                            fontSize: "0.94rem",
                                            lineHeight: 1.7,
                                        }}
                                    >
                                        <strong
                                            style={{
                                                display: "block",
                                                color: colors.heading,
                                                marginBottom: 2,
                                            }}
                                        >
                                            {item.title}
                                        </strong>
                                        {item.text}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <p
                            style={{
                                margin: "22px 0 0",
                                color: colors.body,
                                fontSize: "0.92rem",
                                lineHeight: 1.8,
                                textAlign: align,
                            }}
                        >
                            {t.pdplDisclaimer}
                        </p>

                        <a
                            href={PDPL_SOURCE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: "inline-block",
                                marginTop: 14,
                                ...linkStyle,
                                fontSize: "0.92rem",
                            }}
                        >
                            {t.pdplSourceLabel} ↗
                        </a>
                    </div>
                </section>

                {/* Understanding the results */}
                <section style={sectionStyle} aria-labelledby="reading-results">
                    {sectionHeading("reading-results", t.resultsTitle)}

                    <p style={{ ...paragraphStyle, maxWidth: 720 }}>{t.resultsIntro}</p>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
                            gap: 12,
                            marginTop: 32,
                        }}
                    >
                        {t.riskLevels.map((risk, i) => (
                            <article
                                key={risk.label}
                                style={{
                                    ...card,
                                    padding: "20px 22px",
                                    textAlign: align,
                                    borderInlineStart: `4px solid ${
                                        i === 0 ? "#22c55e" : i === 1 ? "#f59e0b" : "#ef4444"
                                    }`,
                                }}
                            >
                                <h3
                                    style={{
                                        margin: "0 0 6px",
                                        color: colors.heading,
                                        fontSize: "1rem",
                                        fontWeight: 700,
                                    }}
                                >
                                    {risk.label}
                                </h3>
                                <p style={{ ...paragraphStyle, fontSize: "0.92rem" }}>
                                    {risk.text}
                                </p>
                            </article>
                        ))}
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
                            gap: 16,
                            marginTop: 16,
                            alignItems: "start",
                        }}
                    >
                        <ul
                            style={{
                                ...card,
                                listStyle: "none",
                                margin: 0,
                                padding: "26px 24px",
                                display: "grid",
                                gap: 16,
                            }}
                        >
                            {t.resultsPoints.map((point) => (
                                <li
                                    key={point}
                                    style={{
                                        display: "flex",
                                        gap: 12,
                                        alignItems: "flex-start",
                                        color: colors.body,
                                        fontSize: "0.96rem",
                                        lineHeight: 1.8,
                                        textAlign: align,
                                    }}
                                >
                                    <span
                                        aria-hidden="true"
                                        style={{
                                            flexShrink: 0,
                                            width: 22,
                                            height: 22,
                                            marginTop: 4,
                                            borderRadius: "50%",
                                            background: colors.soft,
                                            color: themeColors.accentText,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <CheckIcon />
                                    </span>
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>

                        <div
                            style={{
                                padding: "26px 24px",
                                borderRadius: 18,
                                background: colors.warnBg,
                                border: `1px solid ${colors.warnBorder}`,
                                color: colors.warnTitle,
                                display: "flex",
                                flexDirection: "column",
                                gap: 12,
                                textAlign: align,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    alignItems: "center",
                                }}
                            >
                                <WarningIcon />
                                <span style={{ fontWeight: 700 }}>{t.calloutTitle}</span>
                            </div>

                            <p
                                style={{
                                    margin: 0,
                                    color: colors.warnText,
                                    fontSize: "0.95rem",
                                    lineHeight: 1.85,
                                }}
                            >
                                {t.limitations}
                            </p>

                            <p
                                style={{
                                    margin: 0,
                                    padding: "12px 14px",
                                    borderRadius: 12,
                                    background: isDark
                                        ? "rgba(245, 158, 11, 0.12)"
                                        : "#fef3c7",
                                    color: colors.warnTitle,
                                    fontSize: "0.92rem",
                                    fontWeight: 700,
                                    lineHeight: 1.7,
                                }}
                            >
                                {t.partialNote}
                            </p>
                        </div>
                    </div>

                    <div
                        style={{
                            marginTop: 26,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px 20px",
                            color: colors.body,
                            fontSize: "0.92rem",
                            lineHeight: 1.8,
                            textAlign: align,
                        }}
                    >
                        <span>{t.dataText}</span>
                        <span>
                            {t.feedbackText}{" "}
                            <Link href="/contact" style={linkStyle}>
                                {t.feedbackLink}
                            </Link>
                        </span>
                    </div>
                </section>

                {/* Team */}
                <section style={sectionStyle} aria-labelledby="team">
                    {sectionHeading("team", t.teamTitle, true)}

                    <p
                        style={{
                            maxWidth: 640,
                            margin: "0 auto 36px",
                            textAlign: "center",
                            color: colors.body,
                            fontSize: "1rem",
                            lineHeight: 1.9,
                        }}
                    >
                        {t.teamSub}
                    </p>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
                            gap: 16,
                        }}
                    >
                        {t.team.map(renderPerson)}
                    </div>
                </section>

                {/* Closing CTA */}
                <section style={sectionStyle} aria-labelledby="closing">
                    <div
                        style={{
                            position: "relative",
                            overflow: "hidden",
                            textAlign: "center",
                            padding: "56px 28px",
                            borderRadius: 24,
                            background: accentGradient,
                            color: themeColors.onAccent,
                            boxShadow: `0 20px 50px color-mix(in srgb, ${accent} 30%, transparent)`,
                        }}
                    >
                        <h2
                            id="closing"
                            style={{
                                margin: "0 0 12px",
                                fontSize: "clamp(1.45rem, 3.2vw, 2rem)",
                                fontWeight: 800,
                                lineHeight: 1.35,
                            }}
                        >
                            {t.closingTitle}
                        </h2>

                        <p
                            style={{
                                maxWidth: 560,
                                margin: "0 auto",
                                opacity: 0.9,
                                lineHeight: 1.9,
                            }}
                        >
                            {t.closingText}
                        </p>

                        <Link
                            href="/analyze"
                            style={{
                                ...ctaBase,
                                marginTop: 26,
                                padding: "13px 26px",
                                background: themeColors.onAccent,
                                color: accent,
                            }}
                        >
                            {t.closingCta}
                        </Link>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            flexWrap: "wrap",
                            gap: "12px 24px",
                            marginTop: 34,
                        }}
                    >
                        <Link href="/privacy" style={linkStyle}>
                            {t.privacyLink}
                        </Link>
                        <Link href="/contact" style={linkStyle}>
                            {t.contactLink}
                        </Link>
                        <Link href="/how-it-works" style={linkStyle}>
                            {t.howLink}
                        </Link>
                    </div>

                    <div style={{ textAlign: "center" }}>
                        <Link
                            href="/"
                            style={{
                                display: "inline-block",
                                marginTop: 36,
                                color: colors.body,
                                fontWeight: 600,
                                textDecoration: "none",
                            }}
                        >
                            {t.backLink}
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}