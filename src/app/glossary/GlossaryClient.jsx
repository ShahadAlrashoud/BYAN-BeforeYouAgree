"use client";

import { useMemo, useState } from "react";
import { useTheme } from "../providers";

const ui = {
  en: {
    title: "Glossary",
    intro:
      "Common terms you'll meet in Terms of Service and Privacy Policies, explained in plain language.",
    search: "Search terms...",
    searchLabel: "Search the glossary",
    count: (n) => `${n} term${n === 1 ? "" : "s"} shown`,
    none: "No matching terms.",
  },
  ar: {
    title: "المصطلحات",
    intro:
      "مصطلحات شائعة في شروط الخدمة وسياسات الخصوصية، مشروحة بلغة بسيطة.",
    search: "ابحث في المصطلحات...",
    searchLabel: "البحث في المصطلحات",
    count: (n) => `عدد المصطلحات المعروضة: ${n}`,
    none: "لا توجد مصطلحات مطابقة.",
  },
};

const TERMS = [
  {
    id: "arbitration",
    en: { term: "Arbitration", def: "A private process where a neutral person, not a court, settles disputes. You usually give up the right to sue in court." },
    ar: { term: "التحكيم", def: "عملية خاصة يفصل فيها طرف محايد في النزاع بدلاً من المحكمة. غالباً تتنازل فيها عن حقك في رفع دعوى أمام القضاء." },
  },
  {
    id: "class-action-waiver",
    en: { term: "Class action waiver", def: "A clause stopping you from joining other users in a group lawsuit against the company." },
    ar: { term: "التنازل عن الدعاوى الجماعية", def: "بند يمنعك من الانضمام إلى مستخدمين آخرين في دعوى جماعية ضد الشركة." },
  },
  {
    id: "cookies",
    en: { term: "Cookies", def: "Small files saved in your browser that remember you, keep you logged in, or track your activity." },
    ar: { term: "ملفات تعريف الارتباط (الكوكيز)", def: "ملفات صغيرة تُحفظ في متصفحك لتتذكرك أو تُبقيك مسجلاً للدخول أو تتبع نشاطك." },
  },
  {
    id: "data-controller",
    en: { term: "Data controller", def: "The organization that decides why and how your personal data is used." },
    ar: { term: "المتحكم في البيانات", def: "الجهة التي تقرر سبب استخدام بياناتك الشخصية وكيفية استخدامها." },
  },
  {
    id: "data-processor",
    en: { term: "Data processor", def: "A company that handles personal data on behalf of the controller, following its instructions." },
    ar: { term: "معالج البيانات", def: "جهة تتعامل مع البيانات الشخصية نيابة عن المتحكم وفق تعليماته." },
  },
  {
    id: "data-retention",
    en: { term: "Data retention", def: "How long a company keeps your data before deleting it." },
    ar: { term: "الاحتفاظ بالبيانات", def: "المدة التي تحتفظ فيها الشركة ببياناتك قبل حذفها." },
  },
  {
    id: "indemnification",
    en: { term: "Indemnification", def: "A promise to cover the company's losses or legal costs if your actions cause a claim against it." },
    ar: { term: "التعويض", def: "تعهد بتغطية خسائر الشركة أو تكاليفها القانونية إذا تسببت أفعالك في مطالبة ضدها." },
  },
  {
    id: "limitation-of-liability",
    en: { term: "Limitation of liability", def: "A clause capping or excluding what the company must pay you if something goes wrong." },
    ar: { term: "تحديد المسؤولية", def: "بند يحدد أو يستثني ما يتعين على الشركة دفعه لك إذا حدث خطأ ما." },
  },
  {
    id: "personal-data",
    en: { term: "Personal data", def: "Any information that can identify you, such as your name, email, phone number, or location." },
    ar: { term: "البيانات الشخصية", def: "أي معلومات يمكن أن تحدد هويتك، مثل الاسم أو البريد الإلكتروني أو رقم الهاتف أو الموقع." },
  },
  {
    id: "third-party-sharing",
    en: { term: "Third-party sharing", def: "When a company gives or sells your data to other companies, such as advertisers or partners." },
    ar: { term: "المشاركة مع أطراف ثالثة", def: "عندما تمنح الشركة بياناتك أو تبيعها لشركات أخرى، مثل المعلنين أو الشركاء." },
  },
  {
    id: "unilateral-changes",
    en: { term: "Unilateral changes", def: "The company's right to change the terms at any time, sometimes without notifying you." },
    ar: { term: "التعديل المنفرد", def: "حق الشركة في تغيير الشروط في أي وقت، أحياناً دون إشعارك." },
  },
  {
    id: "pdpl",
    en: { term: "PDPL", def: "Saudi Arabia's Personal Data Protection Law, which sets rights and duties for handling personal data." },
    ar: { term: "نظام حماية البيانات الشخصية", def: "نظام في المملكة العربية السعودية يحدد الحقوق والواجبات عند التعامل مع البيانات الشخصية." },
  },
];

export default function GlossaryClient() {
  const { lang } = useTheme(); // adjust if your hook names it differently
  const l = lang === "ar" ? "ar" : "en";
  const t = ui[l];
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return TERMS.map((x) => ({ id: x.id, ...x[l] }))
      .filter(
        (x) =>
          !needle ||
          x.term.toLowerCase().includes(needle) ||
          x.def.toLowerCase().includes(needle)
      )
      .sort((a, b) => a.term.localeCompare(b.term, l));
  }, [q, l]);

  return (
    <div
      dir={l === "ar" ? "rtl" : "ltr"}
      style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1rem" }}
    >
      <h1>{t.title}</h1>
      <p>{t.intro}</p>

      <label htmlFor="glossary-search" style={{ display: "block", margin: "1rem 0 .25rem" }}>
        {t.searchLabel}
      </label>
      <input
        id="glossary-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.search}
        style={{
          width: "100%",
          padding: ".6rem .8rem",
          border: "1px solid currentColor",
          borderRadius: 8,
          background: "transparent",
          color: "inherit",
          font: "inherit",
        }}
      />

      <p role="status" style={{ margin: ".5rem 0 1rem" }}>
        {items.length ? t.count(items.length) : t.none}
      </p>

      <dl>
        {items.map((x) => (
          <div
            key={x.id}
            id={x.id}
            style={{ padding: ".9rem 0", borderTop: "1px solid rgba(128,128,128,.4)" }}
          >
            <dt style={{ fontWeight: 700 }}>{x.term}</dt>
            <dd style={{ margin: ".25rem 0 0" }}>{x.def}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}