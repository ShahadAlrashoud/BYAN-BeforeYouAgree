export const welcomeStrings = {
    en: {
        title: "Understand a privacy policy before you agree to it",
        intro: "BYAN reads a website's Privacy Policy or Terms of Service and shows the clauses that may affect you, each with a word-for-word quote from the original text.",
        stepsTitle: "How it works",
        steps: [
            "Give BYAN a link to a policy page.",
            "BYAN finds the risky clauses and checks each one against the original text.",
            "You get a plain-language summary and a risk category: Low, Moderate Risk or High Risk.",
        ],
        allowance: "Each visitor can run one new analysis per day. Results BYAN has already analyzed recently open without using it. No sign-up is needed.",
        tryIt: "Try it",
        demoTitle: "See an example",
        demoLabel: "Example, not a real analysis",
        demoSite: "Sample Service (fictional)",
        demoSummary: "This fictional service shares some data with partners and keeps data for a long time.",
        demoQuoteLabel: "Quote from the policy (fictional)",
        demoScoreLabel: "Risk score",
        demoLevel: "Moderate Risk",
        demoFindings: [
            {
                category: "Third-party sharing",
                quote: "We may share your information with our partners for advertising and analytics.",
                plain: "Your data may reach other companies.",
            },
            {
                category: "Data retention",
                quote: "We keep your information for as long as we consider it useful.",
                plain: "Your data may be stored for an unlimited time.",
            },
        ],
        demoNote: "Made-up text for illustration. It was not produced by an analysis, and nothing is saved.",
        disclaimerLink: "Read the disclaimer",
        cardsTitle: "Recently analyzed websites",
        cardsNote: "Websites analyzed at least 5 times in the last 30 days. A count says nothing about trust.",
        viewAll: "View all",
    },
    ar: {
        // [AR review pending]
        title: "افهم سياسة الخصوصية قبل أن توافق عليها",
        intro: "يقرأ بيان سياسة الخصوصية أو شروط الخدمة لأي موقع، ويعرض البنود التي قد تؤثر عليك، مع اقتباس حرفي من النص الأصلي لكل بند.",
        stepsTitle: "كيف يعمل",
        steps: [
            "أعطِ بيان رابط صفحة السياسة.",
            "يجد بيان البنود الخطرة ويتحقق من كل بند مقابل النص الأصلي.",
            "تحصل على ملخص مبسّط وتصنيف للمخاطر: منخفض أو متوسط الخطورة أو عالي الخطورة.", // [AR review pending]
        ],
        allowance: "يمكن لكل زائر إجراء تحليل جديد واحد في اليوم. النتائج التي حللها بيان مؤخرًا تُفتح دون استهلاكه. لا حاجة إلى التسجيل.",
        tryIt: "جرّب الآن",
        demoTitle: "شاهد مثالًا",
        demoLabel: "مثال، وليس تحليلًا حقيقيًا",
        demoSite: "خدمة نموذجية (وهمية)",
        demoSummary: "هذه الخدمة الوهمية تشارك بعض البيانات مع شركاء وتحتفظ بالبيانات لمدة طويلة.",
        demoQuoteLabel: "اقتباس من السياسة (وهمي)",
        demoScoreLabel: "درجة المخاطر", // [AR review pending]
        demoLevel: "خطر متوسط", // [AR review pending]
        demoFindings: [
            {
                category: "المشاركة مع أطراف ثالثة",
                quote: "قد نشارك معلوماتك مع شركائنا لأغراض الإعلان والتحليلات.",
                plain: "قد تصل بياناتك إلى شركات أخرى.",
            },
            {
                category: "الاحتفاظ بالبيانات",
                quote: "نحتفظ بمعلوماتك طالما رأينا أنها مفيدة.",
                plain: "قد تبقى بياناتك مخزنة لمدة غير محددة.",
            },
        ],
        demoNote: "نص مختلق للتوضيح فقط. لم يُنتَج بتحليل ولا يُحفظ شيء.",
        disclaimerLink: "اقرأ إخلاء المسؤولية",
        cardsTitle: "مواقع حُللت مؤخرًا",
        cardsNote: "مواقع حُللت 5 مرات على الأقل خلال آخر 30 يومًا. العدد لا يدل على الموثوقية.",
        viewAll: "عرض الكل",
    },
} as const;