// FAQ questions and answers, kept in a plain module so both the FAQ page (client)
// and the FAQPage structured data (server) use the exact same text.
export const FAQ = {
    "en": [
        {
            "q": "What is BYAN?",
            "a": "BYAN (Before You Agree) analyzes a website's Terms of Service and Privacy Policy and explains them in plain language, with a Risk Score from 0 to 100 and a list of clauses worth knowing about."
        },
        {
            "q": "Is BYAN legal advice?",
            "a": "No. BYAN provides automated, informational analysis only. For important decisions, always review the original documents or consult a qualified legal professional."
        },
        {
            "q": "Which languages are supported?",
            "a": "Arabic and English. Results follow the language of the actual policy, and you can switch any result to the other language with one click."
        },
        {
            "q": "Do I need to find the policy page myself?",
            "a": "No. Just enter the website's address. BYAN looks for links to the Terms or Privacy Policy and also checks common pages such as /privacy and /terms."
        },
        {
            "q": "How is the Risk Score calculated?",
            "a": "The policy text is analyzed to identify clauses that may affect you, such as how your data is collected, shared, or retained. Each clause receives a risk weight, and the policy gets an overall score from 0 to 100 in one of three categories: Safe, Moderate Risk, or High Risk."
        },
        {
            "q": "What do the clause colors mean?",
            "a": "Red marks high-impact clauses (weight 15 or more), amber marks moderate-impact clauses (8–14), and green marks low-impact clauses (below 8)."
        },
        {
            "q": "Can I compare two websites?",
            "a": "Yes. On any results page, enter a second URL under \"Compare with another URL\" to see both scores, clause counts, and categories side by side."
        },
        {
            "q": "Why couldn't BYAN analyze a website?",
            "a": "Some websites block automated requests or load their content in ways that can't be read automatically. If that happens, try entering the direct link to the site's privacy policy or terms page."
        },
        {
            "q": "Do I need an account?",
            "a": "No. Your analysis is not stored. BYAN doesn't have accounts, sign-up, or login, so Once you leave the page, the results are gone. nothing is saved to a profile."
        },
        {
            "q": "Is my analysis stored?",
            "a": "Each analysis result is stored so it can be opened from its results link. If you're signed in, it's also added to your saved analyses. See our Privacy Policy for details."
        },
        {
            "q": "Can the results be wrong?",
            "a": "Yes. Automated analysis can miss context or misread a clause, and policies change over time. If you think a result is incorrect, please let us know through the Contact page."
        }
    ],
    "ar": [
        {
            "q": "ما هو بيان؟",
            "a": "بيان (قبل أن توافق) يحلل شروط الخدمة وسياسة الخصوصية لأي موقع ويشرحها بلغة بسيطة، مع درجة مخاطر من 0 إلى 100 وقائمة بالبنود التي تستحق الانتباه."
        },
        {
            "q": "هل يُعد بيان استشارة قانونية؟",
            "a": "لا. يقدّم بيان تحليلًا آليًا لأغراض معلوماتية فقط. عند اتخاذ القرارات المهمة، راجع المستندات الأصلية أو استشر مختصًا قانونيًا."
        },
        {
            "q": "ما اللغات المدعومة؟",
            "a": "العربية والإنجليزية. تُعرض النتائج بلغة السياسة الفعلية، ويمكنك تحويل أي نتيجة إلى اللغة الأخرى بنقرة واحدة."
        },
        {
            "q": "هل أحتاج إلى البحث عن صفحة السياسة بنفسي؟",
            "a": "لا. أدخل عنوان الموقع فقط، وسيبحث بيان عن روابط الشروط أو سياسة الخصوصية، ويتحقق أيضًا من الصفحات الشائعة مثل ‎/privacy‎ و‎/terms‎."
        },
        {
            "q": "كيف تُحسب درجة المخاطر؟",
            "a": "يُحلَّل نص السياسة لتحديد البنود التي قد تؤثر عليك، مثل طريقة جمع بياناتك أو مشاركتها أو الاحتفاظ بها. يحصل كل بند على وزن مخاطر، وتحصل السياسة على درجة إجمالية من 0 إلى 100 ضمن إحدى ثلاث فئات: آمن، متوسط الخطورة، أو عالي الخطورة."
        },
        {
            "q": "ماذا تعني ألوان البنود؟",
            "a": "الأحمر للبنود عالية التأثير (وزن 15 أو أكثر)، والأصفر للبنود متوسطة التأثير (8–14)، والأخضر للبنود منخفضة التأثير (أقل من 8)."
        },
        {
            "q": "هل يمكنني المقارنة بين موقعين؟",
            "a": "نعم. في أي صفحة نتائج، أدخل رابطًا ثانيًا تحت \"قارن مع رابط آخر\" لعرض الدرجات وعدد البنود والفئات جنبًا إلى جنب."
        },
        {
            "q": "لماذا لم يتمكن بيان من تحليل موقع ما؟",
            "a": "بعض المواقع تحظر الطلبات الآلية أو تعرض محتواها بطريقة لا يمكن قراءتها تلقائيًا. في هذه الحالة، جرّب إدخال الرابط المباشر لصفحة سياسة الخصوصية أو الشروط."
        },
        {
            "q": "هل أحتاج إلى حساب؟",
            "a": "لا، يمكنك تحليل المواقع دون تسجيل الدخول."
        },
        {
            "q": "هل يتم حفظ التحليل؟",
            "a": "يُحفظ كل تحليل ليمكن فتحه من رابط النتائج الخاص به. وإذا كنت مسجلًا، يُضاف أيضًا إلى تحليلاتك المحفوظة. راجع سياسة الخصوصية لمزيد من التفاصيل."
        },
        {
            "q": "هل يمكن أن تكون النتائج خاطئة؟",
            "a": "نعم. قد يفوّت التحليل الآلي بعض السياق أو يسيء فهم بند ما، كما أن السياسات تتغير بمرور الوقت. إذا كنت تعتقد أن نتيجة ما غير صحيحة، يرجى إبلاغنا عبر صفحة التواصل."
        }
    ]
};
