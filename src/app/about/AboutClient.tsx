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

// TODO: point this at the exact PDPL page or article you want to cite.
const PDPL_SOURCE_URL = "https://sdaia.gov.sa";

const RISK_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

type Item = { title: string; text: string };
type Risk = { label: string; text: string };

type Content = {
  tagline: string;
  strategy: string;
  heroLead: string;
  heroPoints: string[];
  analyzeCta: string;
  howLink: string;
  backLink: string;

  problemTitle: string;
  problemIntro: string;
  problemItems: Item[];

  aboutTitle: string;
  about: string;

  howTitle: string;
  howSteps: Item[];
  howFullLink: string;

  missionTitle: string;
  mission: string;
  visionTitle: string;
  vision: string;

  principlesTitle: string;
  principlesIntro: string;
  principles: Item[];

  pdplTitle: string;
  pdplIntro: string;
  pdplPrinciples: Item[];
  pdplDisclaimer: string;
  pdplSourceLabel: string;

  resultsTitle: string;
  resultsIntro: string;
  riskLevels: Risk[];
  limitsTitle: string;
  limitations: string;
  partialNote: string;
  dataNote: string;
  feedbackText: string;
  feedbackLink: string;

  teamTitle: string;
  teamSub: string;
  team: string[];

  closingTitle: string;
  closingText: string;
  closingCta: string;
  privacyLink: string;
  contactLink: string;
  linkedinLabel: string;
};

const content: Record<"en" | "ar", Content> = {
  en: {
    tagline: "Before You Agree",
    strategy: "Understand the finding. Verify the source. Decide for yourself.",
    heroLead:
      "Most people accept Terms of Service and Privacy Policies without understanding what they say. BYAN turns long, technical policies into clear findings you can check against the original text.",
    heroPoints: [
      "AI-assisted policy analysis",
      "Original clauses beside explanations",
      "Arabic and English",
    ],
    analyzeCta: "Analyze a policy",
    howLink: "How BYAN works",
    backLink: "← Back to homepage",

    problemTitle: "Why BYAN exists",
    problemIntro:
      "Privacy policies are not only long. The details that matter about your data are hard to find, compare, and understand, especially in legal or technical language.",
    problemItems: [
      { title: "Accessibility", text: "Policies are long and hard to navigate." },
      { title: "Comprehension", text: "Legal terms make important conditions hard to follow." },
      { title: "Awareness", text: "Many people don't know how their data is collected, used, or shared." },
    ],

    aboutTitle: "What BYAN does",
    about:
      "BYAN (Before You Agree) is a bilingual platform for reviewing digital agreements, especially Terms of Service and Privacy Policies. It uses AI to organize policy content into findings, and each finding points back to the original text so you can check it yourself.",

    howTitle: "How BYAN works",
    howSteps: [
      { title: "Submit a policy", text: "Paste the text or use a supported input method." },
      { title: "Analyze", text: "BYAN summarizes the text and flags privacy-related points." },
      { title: "Verify", text: "Review the clause each finding refers to in its original wording." },
      { title: "Decide", text: "Use the results as a starting point, then make your own judgment." },
    ],
    howFullLink: "See the full methodology",

    missionTitle: "Our mission",
    mission:
      "Make complex digital agreements easier to understand through accessible, transparent, source-based privacy analysis.",
    visionTitle: "Our vision",
    vision:
      "A digital environment where people can make more informed decisions about their personal data and the services they use.",

    principlesTitle: "Principles behind BYAN",
    principlesIntro:
      "People should be able to understand the terms they are asked to accept, and check the reasoning behind any finding.",
    principles: [
      { title: "Clarity", text: "Explain what the policy means, not just what it says, in plain language." },
      { title: "Transparency", text: "Every finding references the relevant policy text, so you can examine the wording and the reasoning." },
      { title: "User empowerment", text: "Help you ask better questions and decide for yourself, rather than deciding for you." },
    ],

    pdplTitle: "A Saudi privacy context",
    pdplIntro:
      "When reviewing privacy disclosures, BYAN considers selected principles of Saudi Arabia's Personal Data Protection Law (PDPL) and highlights relevant statements for further review. It does not independently determine legal compliance.",
    pdplPrinciples: [
      { title: "Consent", text: "Does the policy explain what you are agreeing to?" },
      { title: "Purpose limitation", text: "Is data used only for the purposes stated?" },
      { title: "Data minimization", text: "Does the amount of data collected fit the service?" },
      { title: "Retention", text: "How long is data kept, and when is it deleted?" },
      { title: "Data subject rights", text: "Can you access, correct, or delete your data?" },
      { title: "Cross-border transfers", text: "Is data shared or stored outside the Kingdom?" },
    ],
    pdplDisclaimer:
      "A highlighted practice is not automatically a violation. BYAN is an informational tool, not an official PDPL assessment, legal opinion, or certification of compliance.",
    pdplSourceLabel: "Read the PDPL on the official SDAIA website",

    resultsTitle: "Understanding the results",
    resultsIntro:
      "BYAN uses AI to summarize policy text and flag possible privacy-related findings. Use the output to decide where to look, not as a replacement for reading the terms or seeking qualified advice.",
    riskLevels: [
      {
        label: "Low risk",
        text: "No significant concerns were flagged in the analyzed text. This does not mean the policy is free of privacy concerns or compliant with applicable law.",
      },
      { label: "Moderate risk", text: "Some findings deserve closer examination." },
      { label: "High risk", text: "Potentially significant privacy concerns were flagged for review." },
    ],
    limitsTitle: "Limits of the analysis",
    limitations:
      "No automated analysis can guarantee that every relevant clause was found or interpreted correctly. Risk levels help you prioritize; they are not a verdict on a company, service, or policy. BYAN does not provide legal advice or make decisions for you. Policies change, so check the original service policy for the latest wording.",
    partialNote:
      "Partial analysis: if BYAN analyzed only part of a document, the result is not a complete review.",
    dataNote:
      "Submitted policy text is used to produce your analysis. To learn how it is stored, retained, and shared, read our Privacy Policy.",
    feedbackText: "Found a result that looks wrong?",
    feedbackLink: "Report an incorrect result",

    teamTitle: "The BYAN team",
    teamSub:
      "BYAN is a university graduation project built by a student team with a shared interest in making digital privacy easier to understand.",
    team: ["Shahad Alrashoud", "Ghadah Almutairi", "Nourah Almudbil"],

    closingTitle: "Before you agree, understand first.",
    closingText:
      "Start by reviewing a Privacy Policy or Terms of Service, and make your decision with a clearer understanding.",
    closingCta: "Start your analysis",
    privacyLink: "Read BYAN's Privacy Policy",
    contactLink: "Contact us",
    linkedinLabel: "LinkedIn",
  },

  ar: {
    tagline: "قبل أن توافق",
    strategy: "افهم النتيجة. تحقق من المصدر. قرّر بنفسك.",
    heroLead:
      "يوافق كثيرون يوميًا على شروط الخدمة وسياسات الخصوصية دون فهم كامل لما تتضمنه. يحوّل بيان هذه الوثائق الطويلة والتقنية إلى نتائج واضحة يمكنك التحقق منها بالرجوع إلى النص الأصلي.",
    heroPoints: [
      "تحليل بمساعدة الذكاء الاصطناعي",
      "نص البند الأصلي بجانب الشرح",
      "دعم العربية والإنجليزية",
    ],
    analyzeCta: "حلّل سياسة",
    howLink: "كيف يعمل بيان",
    backLink: "→ العودة إلى الصفحة الرئيسية",

    problemTitle: "لماذا وُجد بيان؟",
    problemIntro:
      "المشكلة لا تقتصر على طول سياسات الخصوصية؛ فتفاصيل البيانات المهمة يصعب العثور عليها ومقارنتها وفهمها، خاصة حين تُكتب بلغة قانونية أو تقنية.",
    problemItems: [
      { title: "الوصول", text: "السياسات طويلة ويصعب التنقل بين أجزائها." },
      { title: "الفهم", text: "المصطلحات القانونية تجعل الشروط المهمة صعبة المتابعة." },
      { title: "الوعي", text: "كثيرون لا يعرفون كيف تُجمع بياناتهم أو تُستخدم أو تُشارك." },
    ],

    aboutTitle: "ماذا يفعل بيان؟",
    about:
      "بيان (قبل أن توافق) منصة ثنائية اللغة لمراجعة الاتفاقيات الرقمية، وعلى وجه الخصوص شروط الخدمة وسياسات الخصوصية. يستخدم الذكاء الاصطناعي لتنظيم محتوى السياسات في ملاحظات، وترتبط كل ملاحظة بالنص الأصلي لتتمكن من التحقق منها بنفسك.",

    howTitle: "كيف يعمل بيان؟",
    howSteps: [
      { title: "أدخل السياسة", text: "الصق النص أو استخدم طريقة إدخال مدعومة." },
      { title: "التحليل", text: "يلخص بيان النص ويرصد النقاط المتعلقة بالخصوصية." },
      { title: "التحقق", text: "راجع البند الذي تشير إليه كل نتيجة في صياغته الأصلية." },
      { title: "القرار", text: "استخدم النتائج نقطة انطلاق، ثم اتخذ قرارك بنفسك." },
    ],
    howFullLink: "اطلع على شرح المنهجية كاملًا",

    missionTitle: "رسالتنا",
    mission:
      "تبسيط الاتفاقيات الرقمية المعقدة عبر تحليل خصوصية ميسّر وشفاف ومرتبط بالنص الأصلي.",
    visionTitle: "رؤيتنا",
    vision:
      "بيئة رقمية يتخذ فيها الأفراد قرارات أكثر وعيًا بشأن بياناتهم الشخصية والخدمات التي يستخدمونها.",

    principlesTitle: "المبادئ التي يقوم عليها بيان",
    principlesIntro:
      "من حق المستخدم أن يفهم الشروط التي يُطلب منه قبولها، وأن يتحقق من الأساس الذي تقوم عليه أي نتيجة.",
    principles: [
      { title: "الوضوح", text: "شرح ما تعنيه السياسة، لا مجرد ما تقوله، بلغة مبسطة." },
      { title: "الشفافية", text: "كل نتيجة ترتبط بنص السياسة ذي الصلة، لتتمكن من فحص الصياغة والاستدلال معًا." },
      { title: "تمكين المستخدم", text: "مساعدتك على طرح أسئلة أفضل واتخاذ قرارك بنفسك، لا اتخاذه نيابةً عنك." },
    ],

    pdplTitle: "في سياق حماية البيانات السعودي",
    pdplIntro:
      "يأخذ بيان في الاعتبار مبادئ مختارة من نظام حماية البيانات الشخصية السعودي (PDPL) عند مراجعة الإفصاحات المتعلقة بالخصوصية، ويبرز العبارات ذات الصلة لمزيد من الفحص. ولا يحدد بشكل مستقل مدى الامتثال القانوني.",
    pdplPrinciples: [
      { title: "الموافقة", text: "هل توضح السياسة ما توافق عليه؟" },
      { title: "تحديد الغرض", text: "هل تُستخدم البيانات للأغراض المعلنة فقط؟" },
      { title: "تقليل البيانات", text: "هل يتناسب حجم البيانات المجموعة مع الخدمة؟" },
      { title: "مدة الاحتفاظ", text: "كم تُحفظ البيانات، ومتى تُحذف؟" },
      { title: "حقوق صاحب البيانات", text: "هل يمكنك الاطلاع على بياناتك وتصحيحها وحذفها؟" },
      { title: "نقل البيانات خارج المملكة", text: "هل تُشارك البيانات أو تُخزَّن خارج المملكة؟" },
    ],
    pdplDisclaimer:
      "الممارسة المُبرزة ليست مخالفة بالضرورة. بيان أداة معلوماتية، ولا تُعد نتائجه تقييمًا رسميًا للامتثال للنظام أو رأيًا قانونيًا أو شهادة امتثال.",
    pdplSourceLabel: "اطلع على النظام في موقع الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا)",

    resultsTitle: "فهم النتائج",
    resultsIntro:
      "يستخدم بيان الذكاء الاصطناعي لتلخيص نصوص السياسات ورصد مؤشرات محتملة تتعلق بالخصوصية. استخدم النتائج لتحديد ما تراجعه، لا بديلًا عن قراءة الشروط أو طلب المشورة من مختص.",
    riskLevels: [
      {
        label: "مخاطر منخفضة",
        text: "لم تُرصد ملاحظات جوهرية في النص المحلَّل. ولا يعني ذلك أن السياسة خالية من مخاوف الخصوصية أو متوافقة مع الأنظمة المعمول بها.",
      },
      { label: "مخاطر متوسطة", text: "بعض النتائج تستحق مراجعة أدق." },
      { label: "مخاطر مرتفعة", text: "رُصدت مخاوف قد تكون جوهرية على صعيد الخصوصية وتستحق المراجعة." },
    ],
    limitsTitle: "حدود التحليل",
    limitations:
      "لا يمكن لأي تحليل آلي ضمان العثور على كل بند ذي صلة أو تفسيره تفسيرًا صحيحًا. ومستويات المخاطر تساعدك على ترتيب أولويات المراجعة، ولا تمثل حكمًا على شركة أو خدمة أو سياسة. ولا يقدم بيان استشارات قانونية، ولا يتخذ القرارات نيابةً عنك. وقد تتغير السياسات، لذا راجع النص الأصلي لدى الخدمة للاطلاع على أحدث صياغة.",
    partialNote:
      "تحليل جزئي: إذا حلّل بيان جزءًا فقط من الوثيقة، فلا تُعد النتيجة مراجعة كاملة لها.",
    dataNote:
      "يُستخدم نص السياسة الذي تقدمه لإنشاء التحليل. لمعرفة طريقة حفظه ومدة الاحتفاظ به ومشاركته، اطلع على سياسة الخصوصية.",
    feedbackText: "لاحظت نتيجة تبدو غير صحيحة؟",
    feedbackLink: "أبلغ عن نتيجة غير صحيحة",

    teamTitle: "فريق بيان",
    teamSub:
      "بيان مشروع تخرج جامعي طوّره فريق طلابي يجمعه اهتمام مشترك بجعل معلومات الخصوصية الرقمية أسهل فهمًا.",
    team: ["شهد الرشود", "غادة المطيري", "نورة المدبل"],

    closingTitle: "قبل أن توافق، افهم أولًا.",
    closingText:
      "ابدأ بمراجعة سياسة الخصوصية أو شروط الخدمة، واتخذ قرارك بناءً على فهم أوضح.",
    closingCta: "ابدأ التحليل",
    privacyLink: "اقرأ سياسة خصوصية بيان",
    contactLink: "تواصل معنا",
    linkedinLabel: "LinkedIn",
  },
};

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
  const num = (n: number) => (isAr ? n.toLocaleString("ar-SA") : String(n));

  const c = {
    heading: isDark ? "#f1f5f9" : "#0f172a",
    body: isDark ? "#aab6c7" : "#5b6578",
    lead: isDark ? "#e2e8f0" : "#334155",
    soft: themeColors.accentSoft,
    softBorder: `color-mix(in srgb, ${accent} ${isDark ? 40 : 25}%, transparent)`,
    glow: `color-mix(in srgb, ${accent} ${isDark ? 22 : 14}%, transparent)`,
    cardBg: isDark ? "rgba(255, 255, 255, 0.035)" : "#ffffff",
    cardBorder: isDark ? "rgba(148, 163, 184, 0.16)" : "#e6eaf2",
    pageBg: isDark
      ? "linear-gradient(180deg, #0a0e1a 0%, #0f1628 100%)"
      : "linear-gradient(180deg, #ffffff 0%, #f7f8fc 100%)",
    warnBg: isDark ? "rgba(245, 158, 11, 0.08)" : "#fffbeb",
    warnBorder: isDark ? "rgba(245, 158, 11, 0.28)" : "#fde68a",
    warnTitle: isDark ? "#fcd34d" : "#92400e",
    warnText: isDark ? "#fde68a" : "#78350f",
  };

  const gradient = `linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 60%, #000))`;

  const card: CSSProperties = {
    background: c.cardBg,
    border: `1px solid ${c.cardBorder}`,
    borderRadius: 18,
    boxShadow: isDark
      ? "0 8px 30px rgba(0, 0, 0, 0.35)"
      : "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06)",
  };

  const grid = (min: number): CSSProperties => ({
    display: "grid",
    gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`,
    gap: 16,
  });

  const bodyText: CSSProperties = {
    margin: 0,
    color: c.body,
    fontSize: "0.96rem",
    lineHeight: 1.85,
    textAlign: align,
  };

  const itemTitle: CSSProperties = {
    margin: "0 0 8px",
    color: c.heading,
    fontSize: "1.02rem",
    fontWeight: 700,
  };

  const linkStyle: CSSProperties = {
    color: themeColors.accentText,
    fontWeight: 600,
    textDecoration: "none",
  };

  const pill: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    padding: "13px 24px",
    fontWeight: 700,
    textDecoration: "none",
  };

  const sectionStyle: CSSProperties = { marginTop: 88 };

  const sectionTitle = (id: string, title: string, center = false) => (
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
          color: c.heading,
          fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
          fontWeight: 700,
          lineHeight: 1.35,
          textAlign: center ? "center" : align,
        }}
      >
        {title}
      </h2>
    </>
  );

  const badge = (n: number) => (
    <div
      aria-hidden="true"
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        background: gradient,
        color: themeColors.onAccent,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        marginBottom: 14,
      }}
    >
      {num(n)}
    </div>
  );

  return (
    <main
      dir={isAr ? "rtl" : "ltr"}
      className={plex.className}
      style={{ minHeight: "100vh", background: c.pageBg, overflowX: "hidden" }}
    >
      {/* Hero */}
      <header style={{ position: "relative", overflow: "hidden", textAlign: "center", padding: "88px 24px 72px" }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 55% 60% at 50% 0%, ${c.glow}, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative" }}>
          <img
            src="/BYAN-logo.png"
            alt="BYAN"
            width={96}
            height={96}
            style={{ width: 96, height: 96, objectFit: "contain", display: "block", margin: "0 auto 20px" }}
          />

          <h1
            style={{
              margin: "0 0 14px",
              color: c.heading,
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
              border: `1px solid ${c.softBorder}`,
              background: c.soft,
              color: themeColors.accentText,
              fontSize: "0.92rem",
              fontWeight: 600,
            }}
          >
            <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: "50%", background: accent }} />
            {t.tagline}
          </p>

          <p
            style={{
              maxWidth: 660,
              margin: "28px auto 0",
              color: c.lead,
              fontSize: "clamp(1.08rem, 2.5vw, 1.25rem)",
              lineHeight: 1.9,
              fontWeight: 500,
            }}
          >
            {t.heroLead}
          </p>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "24px 0 0",
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
                  ...card,
                  color: c.heading,
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
                    background: c.soft,
                    color: themeColors.accentText,
                  }}
                >
                  <CheckIcon />
                </span>
                {point}
              </li>
            ))}
          </ul>

          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 12, marginTop: 32 }}>
            <Link
              href="/analyze"
              style={{
                ...pill,
                background: accent,
                color: themeColors.onAccent,
                boxShadow: `0 10px 24px color-mix(in srgb, ${accent} 35%, transparent)`,
              }}
            >
              {t.analyzeCta}
            </Link>
            <Link href="/how-it-works" style={{ ...linkStyle, alignSelf: "center" }}>
              {t.howLink} →
            </Link>
          </div>

          <p style={{ margin: "40px auto 0", maxWidth: 600, color: c.heading, fontSize: "1rem", fontWeight: 700 }}>
            {t.strategy}
          </p>
        </div>
      </header>

      <div style={{ width: "100%", maxWidth: 960, margin: "0 auto", padding: "0 24px 96px", boxSizing: "border-box" }}>
        {/* Why BYAN exists */}
        <section aria-labelledby="why-byan">
          {sectionTitle("why-byan", t.problemTitle)}
          <p style={{ ...bodyText, maxWidth: 720 }}>{t.problemIntro}</p>

          <ol style={{ ...grid(260), listStyle: "none", padding: 0, margin: "28px 0 0" }}>
            {t.problemItems.map((item, i) => (
              <li key={item.title} style={{ ...card, padding: "24px 22px", textAlign: align }}>
                <span
                  aria-hidden="true"
                  style={{
                    display: "block",
                    fontSize: "2.2rem",
                    fontWeight: 800,
                    lineHeight: 1,
                    color: c.softBorder,
                    marginBottom: 12,
                  }}
                >
                  {isAr ? num(i + 1) : String(i + 1).padStart(2, "0")}
                </span>
                <h3 style={itemTitle}>{item.title}</h3>
                <p style={{ ...bodyText, fontSize: "0.94rem" }}>{item.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* What BYAN does */}
        <section style={sectionStyle} aria-labelledby="about-byan">
          {sectionTitle("about-byan", t.aboutTitle)}
          <div style={{ ...card, padding: "26px 28px", borderInlineStart: `4px solid ${accent}` }}>
            <p style={{ ...bodyText, color: c.lead, fontSize: "1.02rem" }}>{t.about}</p>
          </div>
        </section>

        {/* How BYAN works */}
        <section style={sectionStyle} aria-labelledby="how-byan">
          {sectionTitle("how-byan", t.howTitle)}

          <ol style={{ ...grid(200), listStyle: "none", padding: 0, margin: 0 }}>
            {t.howSteps.map((step, i) => (
              <li key={step.title} style={{ ...card, padding: "24px 22px", textAlign: align }}>
                {badge(i + 1)}
                <h3 style={itemTitle}>{step.title}</h3>
                <p style={{ ...bodyText, fontSize: "0.94rem" }}>{step.text}</p>
              </li>
            ))}
          </ol>

          <div style={{ marginTop: 20, textAlign: align }}>
            <Link href="/how-it-works" style={linkStyle}>
              {t.howFullLink} →
            </Link>
          </div>
        </section>

        {/* Mission and vision */}
        <section style={sectionStyle} aria-label={t.missionTitle}>
          <div style={grid(300)}>
            <article
              aria-labelledby="mission-title"
              style={{
                padding: "34px 28px",
                borderRadius: 18,
                background: gradient,
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
              <p style={{ margin: 0, fontSize: "1.1rem", lineHeight: 1.85, fontWeight: 600 }}>{t.mission}</p>
            </article>

            <article aria-labelledby="vision-title" style={{ ...card, padding: "34px 28px", textAlign: align }}>
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
              <p style={{ margin: 0, color: c.heading, fontSize: "1.1rem", lineHeight: 1.85, fontWeight: 600 }}>
                {t.vision}
              </p>
            </article>
          </div>
        </section>

        {/* Principles */}
        <section style={sectionStyle} aria-labelledby="principles">
          {sectionTitle("principles", t.principlesTitle)}
          <p style={{ ...bodyText, maxWidth: 720 }}>{t.principlesIntro}</p>

          <div style={{ ...grid(240), marginTop: 28 }}>
            {t.principles.map((p) => (
              <article key={p.title} style={{ ...card, padding: "24px 24px", textAlign: align }}>
                <h3 style={{ ...itemTitle, fontSize: "1.08rem" }}>{p.title}</h3>
                <p style={{ ...bodyText, fontSize: "0.94rem" }}>{p.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Saudi PDPL context */}
        <section style={sectionStyle} aria-labelledby="pdpl-context">
          {sectionTitle("pdpl-context", t.pdplTitle)}

          <div
            style={{
              padding: "30px 26px",
              borderRadius: 20,
              background: c.soft,
              border: `1px solid ${c.softBorder}`,
            }}
          >
            <p style={{ ...bodyText, color: c.heading, maxWidth: 760 }}>{t.pdplIntro}</p>

            <ul style={{ ...grid(250), listStyle: "none", padding: 0, margin: "24px 0 0", gap: 12 }}>
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
                  <span style={{ color: c.body, fontSize: "0.92rem", lineHeight: 1.7 }}>
                    <strong style={{ display: "block", color: c.heading, marginBottom: 2 }}>{item.title}</strong>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>

            <p style={{ margin: "22px 0 0", color: c.body, fontSize: "0.92rem", lineHeight: 1.8, textAlign: align }}>
              {t.pdplDisclaimer}
            </p>

            <a
              href={PDPL_SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-block", marginTop: 14, ...linkStyle, fontSize: "0.92rem" }}
            >
              {t.pdplSourceLabel} ↗
            </a>
          </div>
        </section>

        {/* Understanding the results */}
        <section style={sectionStyle} aria-labelledby="reading-results">
          {sectionTitle("reading-results", t.resultsTitle)}
          <p style={{ ...bodyText, maxWidth: 720 }}>{t.resultsIntro}</p>

          <div style={{ ...grid(260), marginTop: 28 }}>
            {t.riskLevels.map((risk, i) => (
              <article
                key={risk.label}
                style={{
                  ...card,
                  padding: "20px 22px",
                  textAlign: align,
                  borderInlineStart: `4px solid ${RISK_COLORS[i]}`,
                }}
              >
                <h3 style={{ ...itemTitle, fontSize: "1rem", marginBottom: 6 }}>{risk.label}</h3>
                <p style={{ ...bodyText, fontSize: "0.92rem" }}>{risk.text}</p>
              </article>
            ))}
          </div>

          <div
            style={{
              marginTop: 16,
              padding: "26px 26px",
              borderRadius: 18,
              background: c.warnBg,
              border: `1px solid ${c.warnBorder}`,
              color: c.warnTitle,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              textAlign: align,
            }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <WarningIcon />
              <span style={{ fontWeight: 700 }}>{t.limitsTitle}</span>
            </div>

            <p style={{ margin: 0, color: c.warnText, fontSize: "0.95rem", lineHeight: 1.85 }}>
              {t.limitations}
            </p>

            <p
              style={{
                margin: 0,
                padding: "12px 14px",
                borderRadius: 12,
                background: isDark ? "rgba(245, 158, 11, 0.12)" : "#fef3c7",
                color: c.warnTitle,
                fontSize: "0.92rem",
                fontWeight: 700,
                lineHeight: 1.7,
              }}
            >
              {t.partialNote}
            </p>
          </div>

          <div
            style={{
              marginTop: 24,
              display: "flex",
              flexWrap: "wrap",
              gap: "8px 20px",
              color: c.body,
              fontSize: "0.92rem",
              lineHeight: 1.8,
              textAlign: align,
            }}
          >
            <span>{t.dataNote}</span>
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
          {sectionTitle("team", t.teamTitle, true)}
          <p style={{ maxWidth: 640, margin: "0 auto 36px", textAlign: "center", color: c.body, fontSize: "1rem", lineHeight: 1.9 }}>
            {t.teamSub}
          </p>

          <ul style={{ ...grid(220), listStyle: "none", padding: 0 }}>
            {t.team.map((name) => (
              <li
                key={name}
                style={{
                  ...card,
                  padding: "32px 20px 28px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: gradient,
                    color: themeColors.onAccent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.7rem",
                    fontWeight: 700,
                    boxShadow: `0 0 0 6px ${c.soft}`,
                  }}
                >
                  {name.charAt(0)}
                </div>
                <h3 style={{ margin: 0, color: c.heading, fontSize: "1.05rem", fontWeight: 700 }}>{name}</h3>
              </li>
            ))}
          </ul>
        </section>

        {/* Closing */}
        <section style={sectionStyle} aria-labelledby="closing">
          <div
            style={{
              textAlign: "center",
              padding: "56px 28px",
              borderRadius: 24,
              background: gradient,
              color: themeColors.onAccent,
              boxShadow: `0 20px 50px color-mix(in srgb, ${accent} 30%, transparent)`,
            }}
          >
            <h2
              id="closing"
              style={{ margin: "0 0 12px", fontSize: "clamp(1.45rem, 3.2vw, 2rem)", fontWeight: 800, lineHeight: 1.35 }}
            >
              {t.closingTitle}
            </h2>
            <p style={{ maxWidth: 560, margin: "0 auto", opacity: 0.9, lineHeight: 1.9 }}>{t.closingText}</p>
            <Link
              href="/analyze"
              style={{ ...pill, marginTop: 26, background: themeColors.onAccent, color: accent }}
            >
              {t.closingCta}
            </Link>
          </div>

          <nav
            aria-label={t.contactLink}
            style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "12px 24px", marginTop: 32 }}
          >
            <Link href="/privacy" style={linkStyle}>
              {t.privacyLink}
            </Link>
            <Link href="/contact" style={linkStyle}>
              {t.contactLink}
            </Link>
          </nav>

          <div style={{ textAlign: "center" }}>
            <Link
              href="/"
              style={{ display: "inline-block", marginTop: 32, color: c.body, fontWeight: 600, textDecoration: "none" }}
            >
              {t.backLink}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}