// Search titles and meta descriptions for every public page, in English and Arabic.
//
// English titles are the approved ones. Descriptions are 120-160 characters.
//
//  Every "ar" title and description below is a draft. A native
// Arabic speaker must approve them before they are treated as final.
export const SEO_COPY = {
    home: {
        en: {
            title: "BYAN | Terms & Privacy Policy Analyzer (Arabic & English, PDPL)",
            description: "Paste a website link and BYAN reads its Terms of Service and Privacy Policy, then shows a 0–100 risk score in plain Arabic or English, based on the PDPL.",
        },
        // 
        ar: {
            title: "بيان | محلل شروط الخدمة وسياسات الخصوصية (عربي وإنجليزي، PDPL)",
            description: "الصق رابط أي موقع وسيقرأ بيان شروط الخدمة وسياسة الخصوصية، ثم يعرض درجة مخاطر من 0 إلى 100 بلغة بسيطة بالعربية أو الإنجليزية، وفق نظام حماية البيانات الشخصية.",
        },
    },
    howItWorks: {
        en: {
            title: "How BYAN Works | Terms & Privacy Policy Analysis",
            description: "See how BYAN finds a website's Terms and Privacy Policy, analyzes the clauses, checks each finding against the original text, and builds a 0–100 risk score.",
        },
        // 
        ar: {
            title: "كيف يعمل بيان | تحليل شروط الخدمة وسياسات الخصوصية",
            description: "تعرّف على طريقة بيان في إيجاد شروط الموقع وسياسة الخصوصية وتحليل البنود والتحقق من كل نتيجة مقابل النص الأصلي ثم حساب درجة المخاطر من 0 إلى 100.",
        },
    },
    compare: {
        en: {
            title: "Compare Terms & Privacy Policies | BYAN",
            description: "Compare two websites' Terms of Service and Privacy Policies side by side. See the risk score, clause count and categories for each, in Arabic or English.",
        },
        // 
        ar: {
            title: "مقارنة شروط الخدمة وسياسات الخصوصية | بيان",
            description: "قارن بين شروط الخدمة وسياسات الخصوصية لموقعين جنبًا إلى جنب، واطلع على درجة المخاطر وعدد البنود والفئات لكل موقع، بالعربية أو الإنجليزية.",
        },
    },
    glossary: {
        en: {
            title: "Glossary | BYAN",
            description: "Plain-language glossary of Terms of Service and privacy terms: arbitration, data controller, sensitive data, data breach, opt-out, governing law and more.",
        },
        // 
        ar: {
            title: "المصطلحات | بيان",
            description: "قاموس مبسّط لمصطلحات شروط الخدمة والخصوصية، مثل التحكيم وجهة التحكم في البيانات والبيانات الحساسة وتسرب البيانات والانسحاب والقانون الواجب التطبيق.",
        },
    },
    about: {
        en: {
            title: "About BYAN | Before You Agree",
            description: "BYAN (Before You Agree) turns long Terms of Service and Privacy Policies into plain-language summaries and risk scores, in Arabic and English, using the PDPL.",
        },
        // 
        ar: {
            title: "عن بيان | قبل أن توافق",
            description: "بيان (قبل أن توافق) يحوّل شروط الخدمة وسياسات الخصوصية الطويلة إلى ملخصات بلغة بسيطة ودرجات مخاطر، بالعربية والإنجليزية، ويستند إلى نظام حماية البيانات الشخصية.",
        },
    },
    faq: {
        en: {
            title: "FAQ | BYAN",
            description: "Answers about BYAN: how it analyzes Terms of Service and Privacy Policies, how the 0–100 risk score works, supported languages, accounts and stored results.",
        },
        // 
        ar: {
            title: "الأسئلة الشائعة | بيان",
            description: "إجابات عن أسئلة بيان: كيف يحلل شروط الخدمة وسياسات الخصوصية، وكيف تعمل درجة المخاطر من 0 إلى 100، واللغات المدعومة والحسابات والنتائج المحفوظة.",
        },
    },
    contact: {
        en: {
            title: "Contact BYAN",
            description: "Contact the BYAN team with questions, feedback or partnership ideas, or to report an incorrect Terms of Service or Privacy Policy analysis result.",
        },
        // 
        ar: {
            title: "تواصل مع بيان",
            description: "تواصل مع فريق بيان لطرح أسئلتك أو ملاحظاتك أو أفكار الشراكة، أو للإبلاغ عن نتيجة تحليل غير صحيحة لشروط الخدمة أو سياسة الخصوصية.",
        },
    },
    privacy: {
        en: {
            title: "Privacy Policy | BYAN",
            description: "BYAN's Privacy Policy: what personal data we collect, how we use and protect it, how long we keep it, and your rights under Saudi Arabia's PDPL.",
        },
        // 
        ar: {
            title: "سياسة الخصوصية | بيان",
            description: "سياسة الخصوصية في بيان: ما البيانات الشخصية التي نجمعها وكيف نستخدمها ونحميها ومدة الاحتفاظ بها، وحقوقك بموجب نظام حماية البيانات الشخصية السعودي.",
        },
    },
    terms: {
        en: {
            title: "Terms of Use | BYAN",
            description: "BYAN's Terms of Use: how you may use the service, its limits as an automated tool that is not legal advice, accounts, acceptable use and intellectual property.",
        },
        // 
        ar: {
            title: "شروط الاستخدام | بيان",
            description: "شروط استخدام بيان: كيف يمكنك استخدام الخدمة، وحدودها كأداة آلية لا تقدّم استشارة قانونية، والحسابات والاستخدام المقبول والملكية الفكرية.",
        },
    },
    disclaimer: {
        en: {
            title: "Disclaimer | BYAN",
            description: "BYAN's disclaimer: results are automated, informational analysis, not legal advice, and do not certify any company's PDPL compliance. Read the originals.",
        },
        // 
        ar: {
            title: "إخلاء المسؤولية | بيان",
            description: "إخلاء المسؤولية في بيان: النتائج تحليل آلي لأغراض معلوماتية وليست استشارة قانونية ولا تُثبت امتثال أي جهة لنظام حماية البيانات الشخصية. راجع المستندات الأصلية.",
        },
    },
};
