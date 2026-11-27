// "pdpl: true" terms get a PDPL badge. The pdplNote wording must be confirmed by a legal
// reviewer against the official text of the PDPL, including the Arabic statutory terms.
//
// "arPending: true" marks an entry whose Arabic has not been approved by a native speaker.
// Such an entry keeps ar: { term: "", def: "" } and the Arabic view shows the English text with
// an "AR pending" tag (see localized() below). Use it only for new entries not yet reviewed.
// Once approved, paste the Arabic into ar, delete arPending, and add the Arabic phrases to match.ar.
//
// Optional en and ar fields: why (what it means for the user), where (location in the policy).

export const GLOSSARY = [
    {
        id: "arbitration",
        related: ["class-action-waiver", "governing-law"],
        match: { en: ["arbitration"], ar: ["التحكيم"] },
        en: {
            term: "Arbitration",
            def: "A private process where a neutral person, not a court, settles disputes. The arbitrator is selected as stated in the policy. You give up the right to sue in court.",
            why: "You give up the right to take most disputes to court.",
            where: "Section 20 of the Snap Inc. Terms (US). The Snap Group Limited Terms use arbitration only for business users.",
            example: "“Any dispute will be resolved through binding arbitration.”",
        },
        ar: {
            term: "التحكيم",
            def: "عملية خاصة يفصل فيها طرف محايد في النزاع بدلاً من المحكمة. غالباً تتنازل فيها عن حقك في رفع دعوى أمام القضاء.",
            why: "تتنازل عن حقك في رفع معظم النزاعات إلى المحكمة.",
            where: "المادة 20 من شروط Snap Inc. (الولايات المتحدة)، وشروط Snap Group Limited للمستخدمين التجاريين.",
            example: "«تُحل أي نزاعات عن طريق التحكيم الملزم.»",
        },
    },
    {
        id: "class-action-waiver",
        related: ["arbitration", "limitation-of-liability"],
        match: { en: ["class action"], ar: ["الدعاوى الجماعية", "دعوى جماعية"] },
        en: {
            term: "Class action waiver",
            def: "A clause stopping you from joining other users in a group lawsuit against the company.",
            why: "You can't join other users in a single lawsuit.",
            where: "Section 20(i), 'Waiver of Class or Consolidated Actions.'",
            example: "“You waive your right to participate in a class action.”",
        },
        ar: {
            term: "التنازل عن الدعاوى الجماعية",
            def: "بند يمنعك من الانضمام إلى مستخدمين آخرين في دعوى جماعية ضد الشركة.",
            why: "لا يمكنك الانضمام إلى مستخدمين آخرين في دعوى واحدة.",
            where: "المادة 20 (ط)، «التنازل عن الدعاوى الجماعية أو المجمّعة».",
            example: "«تتنازل عن حقك في المشاركة في أي دعوى جماعية.»",
        },
    },
    {
        id: "cookies",
        related: ["personal-data", "third-party-sharing"],
        match: { en: ["cookies"], ar: ["ملفات تعريف الارتباط", "الكوكيز"] },
        en: { term: "Cookies", def: "Small files saved in your browser. Necessary cookies remember you and keep you logged in; tracking cookies follow your activity across sites." },
        ar: { term: "ملفات تعريف الارتباط (الكوكيز)", def: "ملفات صغيرة تُحفظ في متصفحك لتتذكرك أو تُبقيك مسجلاً للدخول أو تتبع نشاطك." },
    },
    {
        id: "data-controller",
        pdpl: true,
        related: ["data-processor", "personal-data"],
        match: { en: ["data controller"], ar: ["المتحكم في البيانات", "جهة التحكم"] },
        pdplNote: {
            en: "The PDPL uses this concept under the name “controlling entity” (جهة التحكم). Confirm exact wording with the official text.",
            ar: "يستخدم النظام هذا المفهوم تحت مسمى «جهة التحكم». يُرجى التأكد من الصياغة الدقيقة من النص الرسمي.",
        },
        en: { term: "Data controller", def: "The organization that decides why and how your personal data is used.", example: "“We act as the controller of the personal data you provide.”" },
        ar: { term: "جهة التحكم (المتحكم في البيانات)", def: "الجهة التي تقرر سبب استخدام بياناتك الشخصية وكيفية استخدامها.", example: "«نحن جهة التحكم في البيانات الشخصية التي تقدمها.»" },
    },
    {
        id: "data-processor",
        pdpl: true,
        related: ["data-controller", "third-party-sharing"],
        match: { en: ["data processor"], ar: ["معالج البيانات", "جهة المعالجة"] },
        pdplNote: {
            en: "The PDPL uses this concept under the name “processing entity” (جهة المعالجة). Confirm exact wording with the official text.",
            ar: "يستخدم النظام هذا المفهوم تحت مسمى «جهة المعالجة». يُرجى التأكد من الصياغة الدقيقة من النص الرسمي.",
        },
        en: { term: "Data processor", def: "A company that handles personal data on behalf of the controller, following its instructions.", example: "“Our cloud provider processes data on our behalf.”" },
        ar: { term: "جهة المعالجة (معالج البيانات)", def: "جهة تتعامل مع البيانات الشخصية نيابة عن المتحكم وفق تعليماته.", example: "«يعالج مزود الخدمة السحابية البيانات نيابة عنا.»" },
    },
    {
        id: "data-retention",
        related: ["personal-data", "data-breach"],
        match: { en: ["retain", "retention"], ar: ["الاحتفاظ بالبيانات", "نحتفظ"] },
        en: { term: "Data retention", def: "How long a company keeps your data before deleting it. Some policies give no fixed period.", example: "“We retain your information for as long as necessary.” (vague: no fixed period)" },
        ar: { term: "الاحتفاظ بالبيانات", def: "المدة التي تحتفظ فيها الشركة ببياناتك قبل حذفها.", example: "«نحتفظ بمعلوماتك للمدة اللازمة.» (غامض: لا توجد مدة محددة)" },
    },
    {
        id: "indemnification",
        related: ["limitation-of-liability"],
        match: { en: ["indemnify", "indemnification", "indemnity"], ar: ["التعويض"] },
        en: {
            term: "Indemnification",
            def: "A promise to compensate the company for its losses or legal costs if your actions lead to a claim against it.",
            why: "You may have to pay Snap's costs, including lawyers' fees, if your use leads to a claim against it.",
            where: "Section 17 of both sets of terms.",
            example: "“You agree to indemnify us against any claims arising from your content.”",
        },
        ar: {
            term: "التعويض",
            def: "تعهد بتغطية خسائر الشركة أو تكاليفها القانونية إذا تسببت أفعالك في مطالبة ضدها.",
            why: "قد تضطر إلى دفع تكاليف Snap، بما فيها أتعاب المحامين، إذا أدى استخدامك إلى مطالبة ضدها.",
            where: "المادة 17 في الشروطين.",
            example: "«توافق على تعويضنا عن أي مطالبات ناشئة عن محتواك.»",
        },
    },
    {
        id: "limitation-of-liability",
        related: ["indemnification", "arbitration"],
        match: { en: ["not liable", "limitation of liability"], ar: ["تحديد المسؤولية", "غير مسؤولين"] },
        en: {
            term: "Limitation of liability",
            def: "A clause capping or excluding what the company must pay you if something goes wrong.",
            why: "In the US terms, most payouts are capped at the greater of $100 or what you paid in the past 12 months.",
            where: "Section 19.",
            example: "“We are not liable for any damages arising from your use of the service.”",
        },
        ar: {
            term: "تحديد المسؤولية",
            def: "بند يحدد أو يستثني ما يتعين على الشركة دفعه لك إذا حدث خطأ ما.",
            why: "في الشروط الأمريكية، يُحدد التعويض غالباً بأعلى المبلغين: 100 دولار أو ما دفعته خلال الأشهر الاثني عشر الماضية.",
            where: "المادة 19.",
            example: "«لا نتحمل المسؤولية عن أي أضرار ناتجة عن استخدامك للخدمة.»",
        },
    },
    {
        id: "personal-data",
        pdpl: true,
        related: ["sensitive-data", "third-party-sharing"],
        match: { en: ["personal data", "personal information"], ar: ["البيانات الشخصية"] },
        pdplNote: {
            en: "Defined and protected by the PDPL. Confirm the exact definition with the official text.",
            ar: "معرّفة ومحمية بموجب النظام. يُرجى التأكد من التعريف الدقيق من النص الرسمي.",
        },
        en: { term: "Personal data", def: "Any information that can identify you, such as your name, email, phone number, or location." },
        ar: { term: "البيانات الشخصية", def: "أي معلومات يمكن أن تحدد هويتك، مثل الاسم أو البريد الإلكتروني أو رقم الهاتف أو الموقع." },
    },
    {
        id: "third-party-sharing",
        related: ["personal-data", "opt-out"],
        match: { en: ["third parties", "third-party"], ar: ["أطراف ثالثة", "طرف ثالث"] },
        en: { term: "Third-party sharing", def: "When a company gives or sells your data to other companies, such as advertisers or partners.", example: "“We may share your data with third parties for advertising purposes.”" },
        ar: { term: "المشاركة مع أطراف ثالثة", def: "عندما تمنح الشركة بياناتك أو تبيعها لشركات أخرى، مثل المعلنين أو الشركاء.", example: "«قد نشارك بياناتك مع أطراف ثالثة لأغراض إعلانية.»" },
    },
    {
        id: "unilateral-changes",
        related: ["automatic-renewal", "governing-law"],
        match: { en: ["change these terms", "modify these terms"], ar: ["تغيير هذه الشروط", "تعديل هذه الشروط"] },
        en: { term: "Unilateral changes", def: "The company's right to change the terms at any time, sometimes without notifying you.", example: "“We may change these terms at any time without notice.”" },
        ar: { term: "التعديل المنفرد", def: "حق الشركة في تغيير الشروط في أي وقت، أحياناً دون إشعارك.", example: "«يجوز لنا تغيير هذه الشروط في أي وقت دون إشعار.»" },
    },
    {
        id: "pdpl",
        pdpl: true,
        related: ["personal-data", "data-controller"],
        match: { en: ["PDPL"], ar: ["نظام حماية البيانات الشخصية"] },
        en: { term: "PDPL", def: "Saudi Arabia's Personal Data Protection Law, which sets rights and duties for handling personal data." },
        ar: { term: "نظام حماية البيانات الشخصية", def: "نظام في المملكة العربية السعودية يحدد الحقوق والواجبات عند التعامل مع البيانات الشخصية." },
    },
    {
        id: "governing-law",
        related: ["arbitration", "unilateral-changes", "exclusive-venue"],
        match: { en: ["governed by the laws", "governing law", "choice of law"], ar: ["القانون الواجب التطبيق", "تخضع لقوانين"] },
        en: {
            term: "Governing law",
            def: "The country or state whose laws apply to any dispute. It may be far from where you live.",
            why: "It determines which legal rules apply to your case.",
            where: "Section 22. US terms use California law. The Snap Group Limited terms use the law of England and Wales.",
            example: "“These terms are governed by the laws of a jurisdiction of our choosing.”",
        },
        ar: {
            term: "القانون الواجب التطبيق",
            def: "قانون الدولة أو الولاية الذي يُطبَّق على أي نزاع، وقد يكون بعيداً عن مكان إقامتك.",
            why: "يحدد القواعد القانونية التي ستُطبّق على قضيتك.",
            where: "المادة 22. تستخدم الشروط الأمريكية قانون كاليفورنيا، وتستخدم شروط Snap Group Limited قانون إنجلترا وويلز.",
            example: "«تخضع هذه الشروط لقوانين الجهة التي نختارها.»",
        },
    },
    {
        id: "automatic-renewal",
        related: ["opt-out", "unilateral-changes"],
        match: { en: ["renew automatically", "automatic renewal", "auto-renew"], ar: ["التجديد التلقائي", "تتجدد تلقائياً"] },
        en: { term: "Automatic renewal", def: "A subscription that renews and charges you again each period unless you cancel in time.", example: "“Subscriptions renew automatically until you cancel.”" },
        ar: { term: "التجديد التلقائي", def: "اشتراك يتجدد ويُحاسَب عليه مجدداً في كل فترة ما لم تلغه في الوقت المناسب.", example: "«تتجدد الاشتراكات تلقائياً إلى أن تقوم بإلغائها.»" },
    },
    {
        id: "sensitive-data",
        pdpl: true,
        related: ["personal-data", "data-breach"],
        match: { en: ["sensitive data", "sensitive information"], ar: ["البيانات الحساسة"] },
        pdplNote: {
            en: "The PDPL gives sensitive data extra protection. Confirm the listed categories with the official text.",
            ar: "يمنح النظام البيانات الحساسة حماية إضافية. يُرجى التأكد من الفئات من النص الرسمي.",
        },
        en: { term: "Sensitive data", def: "Personal data that could harm you if misused, such as health, religion, biometrics or financial details (to be confirmed against the PDPL).", example: "“We may collect biometric information to verify your identity.”" },
        ar: { term: "البيانات الحساسة", def: "بيانات شخصية قد تضرك إذا أُسيء استخدامها، مثل البيانات الصحية أو الدينية أو الحيوية أو المالية.", example: "«قد نجمع بيانات حيوية للتحقق من هويتك.»" },
    },
    {
        id: "data-breach",
        pdpl: true,
        related: ["sensitive-data", "data-retention"],
        match: { en: ["data breach", "security breach"], ar: ["تسرب البيانات", "اختراق البيانات"] },
        pdplNote: {
            en: "The PDPL has rules on notifying people about data leaks. Confirm the details with the official text.",
            ar: "يتضمن النظام أحكاماً بشأن إشعار الأفراد عند تسرب البيانات. يُرجى التأكد من التفاصيل من النص الرسمي.",
        },
        en: { term: "Data breach", def: "When personal data is accessed, leaked or stolen by someone who shouldn't have it.", example: "“We will notify you of a breach where required by law.”" },
        ar: { term: "تسرب البيانات", def: "عندما يصل شخص غير مصرّح له إلى بيانات شخصية أو تتسرب أو تُسرق.", example: "«سنخطرك بأي تسرب للبيانات عندما يقتضي النظام ذلك.»" },
    },
    {
        id: "opt-out",
        related: ["third-party-sharing", "automatic-renewal"],
        match: { en: ["opt out", "opt-out"], ar: ["الانسحاب"] },
        pdplNote: {
            en: "How the PDPL treats opting out is to be confirmed against the official text.",
            ar: "طريقة تناول النظام للانسحاب يجب التأكد منها من النص الرسمي.",
        },
        en: { term: "Opt-out", def: "Your ability to say no to something that is on by default, such as marketing or data sharing.", example: "“You may opt out of marketing emails at any time.”" },
        ar: { term: "الانسحاب (Opt-out)", def: "قدرتك على رفض أمر مفعّل افتراضياً، مثل الرسائل التسويقية أو مشاركة البيانات.", example: "«يمكنك الانسحاب من الرسائل التسويقية في أي وقت.»" },
    },
    {
        id: "tracking",
        related: ["cookies", "third-party-sharing"],
        match: { en: ["tracking"], ar: ["التتبع"] },
        en: { term: "Tracking", def: "Following your activity across websites or apps.", example: "“We track your activity across sites.”" },
        ar: { term: "التتبع", def: "متابعة نشاطك عبر المواقع أو التطبيقات.", example: "«نتتبع نشاطك عبر المواقع.»" },
    },
    {
        id: "advertising",
        related: ["third-party-sharing"],
        match: { en: ["advertising", "ads"], ar: ["الإعلانات"] },
        en: { term: "Advertising", def: "Showing ads based on your data or activity.", example: "“We may show you ads based on your data.”" },
        ar: { term: "الإعلانات", def: "عرض إعلانات مبنية على بياناتك أو نشاطك.", example: "«قد نعرض عليك إعلانات بناءً على بياناتك.»" },
    },
    {
        id: "consent",
        related: ["opt-out"],
        match: { en: ["consent"], ar: ["الموافقة"] },
        en: { term: "Consent", def: "Your agreement to a company collecting or using your data.", example: "“By continuing, you consent to our use of cookies.”" },
        ar: { term: "الموافقة", def: "موافقتك على أن تجمع الشركة بياناتك أو تستخدمها.", example: "«بمتابعتك، فإنك توافق على استخدامنا لملفات تعريف الارتباط.»" },
    },
    {
        id: "data-broker",
        related: ["third-party-sharing", "personal-data"],
        match: { en: ["data broker", "data brokers"], ar: ["وسيط البيانات", "وسطاء البيانات"] },
        en: { term: "Data broker", def: "A company that collects personal information from many sources and sells it to other companies." },
        ar: { term: "وسيط البيانات", def: "شركة تجمع المعلومات الشخصية من مصادر متعددة وتبيعها لشركات أخرى." },
    },
    {
        id: "telemetry",
        related: ["personal-data", "cookies"],
        match: { en: ["telemetry"], ar: ["القياس عن بعد"] },
        en: { term: "Telemetry", def: "Automatic data a service collects about how you use its software or device.", example: "“We collect usage data to improve performance.”" },
        ar: { term: "القياس عن بُعد (Telemetry)", def: "بيانات تجمعها الخدمة تلقائياً عن طريقة استخدامك لبرامجها أو جهازها.", example: "«نجمع بيانات الاستخدام لتحسين الأداء.»" },
    },
    {
        id: "negative-option",
        related: ["automatic-renewal", "opt-out"],
        match: { en: ["negative option"], ar: ["الخيار السلبي"] },
        en: { term: "Negative option", def: "A clause that treats your silence or continued use as agreement, such as an automatic renewal." },
        ar: { term: "الخيار السلبي", def: "بند يعتبر صمتك أو استمرارك في الاستخدام موافقة، مثل التجديد التلقائي." },
    },

    // NEW ENTRIES

    {
        id: "data-subject-rights",
        related: ["personal-data", "consent", "data-portability", "consent-withdrawal"],
        match: { en: ["data subject rights", "rights of data subjects"], ar: ["حقوق صاحب البيانات"] },
        en: { term: "Data subject rights", def: "The rights a person may have over their personal data, such as requesting access, correction, or deletion where applicable under the law.", example: "“You may request access to or correction of your personal data.”" },
        ar: { term: "حقوق صاحب البيانات", def: "الحقوق التي قد تتمتع بها على بياناتك الشخصية، مثل طلب الاطلاع عليها أو تصحيحها أو حذفها متى كان ذلك منصوصاً عليه في القانون.", example: "«يحق لك طلب الاطلاع على بياناتك الشخصية أو تصحيحها.»" },
    },
    {
        id: "data-processing",
        related: ["data-controller", "data-processor", "personal-data", "lawful-basis"],
        match: { en: ["data processing", "processing of personal data"], ar: ["معالجة البيانات"] },
        en: { term: "Data processing", def: "Any action performed on personal data, such as collecting, recording, organizing, storing, using, sharing, or deleting it.", example: "“We process your information to provide and maintain the service.”" },
        ar: { term: "معالجة البيانات", def: "أي إجراء يُنفَّذ على البيانات الشخصية، مثل جمعها أو تسجيلها أو تنظيمها أو تخزينها أو استخدامها أو مشاركتها أو حذفها.", example: "«نعالج معلوماتك لتقديم الخدمة وتشغيلها.»" },
    },
    {
        id: "lawful-basis",
        related: ["consent", "data-processing", "purpose-limitation"],
        match: { en: ["lawful basis", "legal basis for processing"], ar: ["الأساس النظامي"] },
        en: { term: "Lawful basis", def: "The legal reason an organization relies on to process personal data. Consent may be one basis, but it is not the only possible one.", example: "“We process this information where we have a lawful basis to do so.”" },
        ar: { term: "الأساس النظامي للمعالجة", def: "السبب النظامي الذي تستند إليه الجهة في معالجة البيانات الشخصية. قد تكون الموافقة أحد هذه الأسس، لكنها ليست الأساس الوحيد الممكن.", example: "«نعالج هذه المعلومات حيث يتوفر لدينا أساس نظامي لذلك.»" },
    },
    {
        id: "purpose-limitation",
        related: ["data-minimization", "lawful-basis", "data-processing"],
        match: { en: ["purpose limitation", "specified purposes"], ar: ["تقييد الغرض"] },
        en: { term: "Purpose limitation", def: "The principle that personal data should be collected for clear purposes and not used in ways that are incompatible with those purposes.", example: "“We use the information for the purposes explained when it was collected.”" },
        ar: { term: "تقييد الغرض", def: "مبدأ يقضي بجمع البيانات الشخصية لأغراض واضحة، وعدم استخدامها بطرق تتعارض مع تلك الأغراض.", example: "«نستخدم المعلومات للأغراض التي شُرحت عند جمعها.»" },
    },
    {
        id: "data-minimization",
        related: ["purpose-limitation", "personal-data", "data-processing"],
        match: { en: ["data minimization", "data minimisation", "minimum amount of data"], ar: ["تقليل البيانات"] },
        en: { term: "Data minimization", def: "The principle of collecting and using only the personal data that is necessary for a specific purpose.", example: "“We only request the information needed to create your account.”" },
        ar: { term: "تقليل البيانات", def: "مبدأ جمع البيانات الشخصية واستخدامها بالقدر الضروري فقط لغرض محدد.", example: "«نطلب فقط المعلومات اللازمة لإنشاء حسابك.»" },
    },
    {
        id: "cross-border-data-transfer",
        related: ["personal-data", "data-controller", "data-processor"],
        match: { en: ["cross-border data transfer", "international data transfer", "transfer data overseas"], ar: ["نقل البيانات عبر الحدود"] },
        en: { term: "Cross-border data transfer", def: "Sending personal data to, or making it accessible in, another country. Additional legal requirements may apply depending on the countries and circumstances.", example: "“Your information may be transferred to service providers in other countries.”" },
        ar: { term: "نقل البيانات عبر الحدود", def: "إرسال البيانات الشخصية إلى دولة أخرى، أو إتاحتها فيها. قد تنطبق متطلبات نظامية إضافية بحسب الدول والظروف.", example: "«قد يتم نقل معلوماتك إلى مزودي خدمات في دول أخرى.»" },
    },
    {
        id: "consent-withdrawal",
        related: ["consent", "data-subject-rights", "opt-out"],
        match: { en: ["withdraw consent", "withdrawal of consent", "consent withdrawal"], ar: ["سحب الموافقة"] },
        en: { term: "Consent withdrawal", def: "Taking back permission you previously gave for a particular use of your personal data. Withdrawal may not affect processing that was lawful before you withdrew consent.", example: "“You can withdraw your consent at any time through your account settings.”" },
        ar: { term: "سحب الموافقة", def: "استرداد الإذن الذي منحته سابقاً لاستخدام محدد لبياناتك الشخصية. وقد لا يؤثر السحب على المعالجة التي كانت نظامية قبل سحب الموافقة.", example: "«يمكنك سحب موافقتك في أي وقت من إعدادات حسابك.»" },
    },
    {
        id: "data-portability",
        related: ["data-subject-rights", "personal-data"],
        match: { en: ["data portability", "portable copy of your data"], ar: ["قابلية نقل البيانات"] },
        en: { term: "Data portability", def: "The ability, where provided by applicable law, to receive certain personal data in a usable format and sometimes transfer it to another organization.", example: "“You may request a copy of eligible account data in a downloadable format.”" },
        ar: { term: "قابلية نقل البيانات", def: "القدرة، متى نص عليها النظام المعمول به، على الحصول على بيانات شخصية معينة بصيغة قابلة للاستخدام، وأحياناً نقلها إلى جهة أخرى.", example: "«يمكنك طلب نسخة من بيانات حسابك المؤهلة بصيغة قابلة للتنزيل.»" },
    },
    {
        id: "profiling",
        related: ["personal-data", "behavioral-advertising", "automated-decision-making"],
        match: { en: ["profiling", "profile you", "build a profile"], ar: ["التنميط"] },
        en: { term: "Profiling", def: "Using personal data to analyze or predict things about a person, such as their interests, preferences, behavior, or likely choices.", example: "“We may use your activity to build a profile of your interests.”" },
        ar: { term: "إنشاء الملفات الشخصية (التنميط)", def: "استخدام البيانات الشخصية لتحليل أمور تخص الشخص أو التنبؤ بها، مثل اهتماماته وتفضيلاته وسلوكه أو خياراته المرجحة.", example: "«قد نستخدم نشاطك لبناء ملف شخصي عن اهتماماتك.»" },
    },
    {
        id: "behavioral-advertising",
        related: ["advertising", "tracking", "profiling", "cookies"],
        match: { en: ["behavioral advertising", "behavioural advertising", "interest-based advertising"], ar: ["الإعلانات السلوكية"] },
        en: { term: "Behavioral advertising", def: "Advertising selected or personalized based on information about your activity, interests, or behavior, often collected over time.", example: "“We use browsing activity to show interest-based ads.”" },
        ar: { term: "الإعلانات السلوكية", def: "إعلانات تُختار أو تُخصص بناءً على معلومات عن نشاطك أو اهتماماتك أو سلوكك، غالباً مما يُجمع عبر الزمن.", example: "«نستخدم سجل التصفح لعرض إعلانات تناسب اهتماماتك.»" },
    },
    {
        id: "device-fingerprinting",
        related: ["tracking", "cookies", "personal-data"],
        match: { en: ["device fingerprinting", "browser fingerprinting", "digital fingerprint"], ar: ["بصمة الجهاز"] },
        en: { term: "Device fingerprinting", def: "A technique that combines details about your device or browser, such as settings and technical characteristics, to recognize it or distinguish it from other devices.", example: "“We may use device characteristics to help recognize returning visitors.”" },
        ar: { term: "بصمة الجهاز", def: "تقنية تجمع تفاصيل عن جهازك أو متصفحك، مثل الإعدادات والخصائص التقنية، للتعرف عليه أو تمييزه عن الأجهزة الأخرى.", example: "«قد نستخدم خصائص الجهاز للمساعدة في التعرف على الزوار العائدين.»" },
    },
    {
        id: "termination",
        related: ["suspension", "automatic-renewal", "unilateral-changes"],
        match: { en: ["termination", "terminate this agreement", "terminate your account"], ar: ["الإنهاء"] },
        en: {
            term: "Termination",
            def: "Ending an agreement or service. The terms may explain when you or the company can end it and what happens afterward. You can also end your use by deleting your account.",
            why: "Violations of the Community Guidelines come with notice and a right to appeal.",
            where: "Section 16.",
            example: "“Either party may terminate this agreement by giving written notice.”",
        },
        ar: {
            term: "الإنهاء",
            def: "إنهاء الاتفاقية أو الخدمة. قد تبين الشروط متى يمكنك أنت أو الشركة إنهاءها وما يترتب على ذلك. ويمكنك أيضاً إنهاء استخدامك بحذف حسابك.",
            why: "المخالفات لإرشادات المجتمع تأتي مع إشعار وحق في الاستئناف.",
            where: "المادة 16.",
            example: "«يجوز لأي من الطرفين إنهاء هذه الاتفاقية بإشعار كتابي.»",
        },
    },
    {
        id: "suspension",
        related: ["termination", "unilateral-changes"],
        match: { en: ["suspension", "suspend your account", "suspend access"], ar: ["الإيقاف المؤقت"] },
        en: { term: "Suspension", def: "A temporary restriction on your account or access to a service, often because of suspected rule violations, security concerns, or non-payment.", example: "“We may suspend access if we detect activity that violates these terms.”" },
        ar: { term: "الإيقاف المؤقت", def: "تقييد مؤقت لحسابك أو لوصولك إلى الخدمة، غالباً بسبب الاشتباه في مخالفة القواعد أو مخاوف أمنية أو عدم السداد.", example: "«قد نوقف الوصول إذا رصدنا نشاطاً يخالف هذه الشروط.»" },
    },
    {
        id: "license-agreement",
        related: ["intellectual-property-rights", "termination"],
        match: { en: ["license agreement", "software license", "licence agreement"], ar: ["اتفاقية الترخيص"] },
        en: { term: "License agreement", def: "An agreement that gives you permission to use software, content, or another product under stated conditions. It usually does not mean you own it.", example: "“We grant you a limited, non-transferable license to use the app.”" },
        ar: { term: "اتفاقية الترخيص", def: "اتفاقية تمنحك إذناً باستخدام برنامج أو محتوى أو منتج آخر وفق شروط محددة. وغالباً لا تعني أنك تملكه.", example: "«نمنحك ترخيصاً محدوداً غير قابل للتحويل لاستخدام التطبيق.»" },
    },
    {
        id: "subprocessor",
        related: ["data-processor", "data-controller", "third-party-sharing"],
        match: { en: ["subprocessor", "sub-processors", "sub-processor"], ar: ["المعالج الفرعي", "المعالجات الفرعية"] },
        en: { term: "Subprocessor", def: "A third party engaged by a data processor to help process personal data on behalf of the organization responsible for it.", example: "“Our hosting provider may use subprocessors to support the service.”" },
        ar: { term: "المعالج الفرعي", def: "طرف ثالث يتعاقد معه معالج البيانات للمساعدة في معالجة البيانات الشخصية نيابة عن الجهة المسؤولة عنها.", example: "«قد يستعين مزود الاستضافة لدينا بمعالجات فرعية لدعم الخدمة.»" },
    },

    // Entries from the Snap Terms review.

    {
        id: "arbitration-opt-out",
        related: ["arbitration", "pre-arbitration-demand", "class-action-waiver"],
        match: { en: ["arbitration opt-out", "opt out of arbitration"], ar: ["حق الانسحاب من التحكيم"] },
        en: {
            term: "Arbitration opt-out",
            def: "A time-limited right to reject arbitration by sending a written notice to the company.",
            why: "It's the only way to keep your right to go to court. The deadline is 30 days.",
            where: "Section 20(k) of the Snap Inc. Terms (US).",
        },
        ar: {
            term: "حق الانسحاب من التحكيم",
            def: "حق محدد المدة في رفض التحكيم عبر إشعار كتابي ترسله إلى الشركة.",
            why: "هو الطريقة الوحيدة للحفاظ على حقك في اللجوء إلى المحكمة، والمهلة 30 يوماً.",
            where: "المادة 20 (ك) من شروط Snap Inc. (الولايات المتحدة).",
        },
    },
    {
        id: "pre-arbitration-demand",
        related: ["arbitration", "arbitration-opt-out"],
        match: { en: ["pre-arbitration demand", "notice of dispute"], ar: ["طلب ما قبل التحكيم"] },
        en: {
            term: "Pre-arbitration demand",
            def: "A formal written notice that must be sent, and waited on for 60 days, before an arbitration can start.",
            why: "You must try to settle the dispute in writing before you can file for arbitration.",
            where: "Section 20(b) of the Snap Inc. Terms (US).",
        },
        ar: {
            term: "طلب ما قبل التحكيم",
            def: "إشعار كتابي رسمي يجب إرساله وانتظار 60 يوماً قبل بدء أي إجراء تحكيم.",
            why: "عليك محاولة حل النزاع كتابياً قبل أن تتمكن من تقديم طلب تحكيم.",
            where: "المادة 20 (ب) من شروط Snap Inc. (الولايات المتحدة).",
        },
    },
    {
        id: "exclusive-venue",
        related: ["governing-law", "arbitration"],
        match: { en: ["exclusive venue", "exclusive jurisdiction"], ar: ["الاختصاص القضائي الحصري", "الاختصاص القضائي"] },
        en: {
            term: "Exclusive venue",
            def: "The one court where all lawsuits under the terms must be filed.",
            why: "Even if you live elsewhere, cases must go to that court.",
            where: "Section 21. The US terms name California courts, and the UK terms name England's courts.",
        },
        ar: {
            term: "الاختصاص القضائي الحصري",
            def: "المحكمة الوحيدة التي يجب رفع جميع الدعاوى المتعلقة بالشروط أمامها.",
            why: "حتى لو كنت تعيش في مكان آخر، يجب رفع القضايا إلى تلك المحكمة.",
            where: "المادة 21. تحدد شروط الولايات المتحدة محاكم كاليفورنيا، وتحدد الشروط البريطانية محاكم إنجلترا.",
        },
    },
    {
        id: "as-is-disclaimer",
        related: ["limitation-of-liability", "inputs-outputs"],
        match: { en: ["as is", "as-is", "disclaimer of warranties"], ar: ["الخدمة كما هي"] },
        en: {
            term: "As-is (disclaimer of warranties)",
            def: "The service is provided 'as is,' with no promise that it will always work, be error-free, or show accurate content.",
            why: "If the service breaks or information is wrong, the company doesn't guarantee otherwise.",
            where: "Section 18. For AI outputs, also see Section 6.",
        },
        ar: {
            term: "الخدمة كما هي (إخلاء الضمانات)",
            def: "تُقدَّم الخدمة «كما هي» دون وعد بأنها ستعمل دائماً بلا أخطاء، أو بأن المحتوى دقيق.",
            why: "إذا تعطلت الخدمة أو كانت المعلومات خاطئة، فالشركة لا تضمن غير ذلك.",
            where: "المادة 18. وبالنسبة لمخرجات الذكاء الاصطناعي، راجع المادة 6.",
        },
    },
    {
        id: "royalty-free-license",
        related: ["sublicensable", "irrevocable-license", "public-content"],
        match: { en: ["royalty-free", "royalty free"], ar: ["بلا إتاوة"] },
        en: {
            term: "Royalty-free license",
            def: "Permission to use your content without paying you an ongoing fee.",
            why: "You get no payment when Snap uses what you post.",
            where: "Section 2, 'Rights You Grant Us.'",
        },
        ar: {
            term: "ترخيص بلا إتاوة",
            def: "إذن باستخدام محتواك دون أن تدفع لك الشركة رسوماً متكررة.",
            why: "لن تحصل على أي مبلغ عندما تستخدم Snap ما تنشره.",
            where: "المادة 2، «الحقوق التي تمنحنا إياها».",
        },
    },
    {
        id: "sublicensable",
        related: ["royalty-free-license", "third-party-sharing"],
        match: { en: ["sublicensable", "sublicense"], ar: ["من الباطن"] },
        en: {
            term: "Sublicensable",
            def: "The company can pass the rights it has in your content on to other parties.",
            why: "Partner companies that help run the service can use your content under that license.",
            where: "Section 2.",
        },
        ar: {
            term: "قابل للترخيص من الباطن",
            def: "تستطيع الشركة نقل الحقوق التي لديها في محتواك إلى جهات أخرى.",
            why: "يمكن لشركات الشراكة التي تدير الخدمة استخدام محتواك بموجب هذا الترخيص.",
            where: "المادة 2.",
        },
    },
    {
        id: "irrevocable-license",
        related: ["royalty-free-license", "public-content", "derivative-works"],
        match: { en: ["irrevocable", "perpetual license"], ar: ["غير قابل للإلغاء"] },
        en: {
            term: "Irrevocable and perpetual license",
            def: "A permission you can't take back, and which can last indefinitely.",
            why: "Once you post public content, the license may continue even after you delete it.",
            where: "Section 2, 'Public Content.' The UK terms say copies may be kept on servers indefinitely.",
        },
        ar: {
            term: "ترخيص غير قابل للإلغاء ودائم",
            def: "إذن لا يمكنك سحبه، ويمكن أن يستمر إلى أجل غير مسمى.",
            why: "بعد نشر المحتوى العام، قد يستمر الترخيص حتى بعد حذفه.",
            where: "المادة 2، «المحتوى العام». تنص الشروط البريطانية على إمكانية الاحتفاظ بنسخ على الخوادم إلى أجل غير مسمى.",
        },
    },
    {
        id: "public-content",
        related: ["irrevocable-license", "derivative-works"],
        match: { en: ["public content"], ar: ["المحتوى العام"] },
        en: {
            term: "Public content",
            def: "Anything you submit to public features such as Spotlight, Public Profiles, or Snap Map.",
            why: "It's covered by the broadest license, and others may reuse it.",
            where: "Section 2, 'Public Content.'",
        },
        ar: {
            term: "المحتوى العام",
            def: "أي شيء ترسله إلى ميزات عامة مثل Spotlight أو الملفات الشخصية العامة أو Snap Map.",
            why: "يخضع لأوسع ترخيص، ويمكن للآخرين إعادة استخدامه.",
            where: "المادة 2، «المحتوى العام».",
        },
    },
    {
        id: "derivative-works",
        related: ["public-content", "irrevocable-license"],
        match: { en: ["derivative works"], ar: ["الأعمال المشتقة"] },
        en: {
            term: "Derivative works",
            def: "New works made from your content, such as edits, remixes, or compilations.",
            why: "Your post can be turned into something new by others, and you may not be paid.",
            where: "Section 2, 'Public Content.'",
        },
        ar: {
            term: "الأعمال المشتقة",
            def: "أعمال جديدة مبنية على محتواك، مثل المونتاج أو إعادة المزج أو التعديلات.",
            why: "يمكن للآخرين تحويل منشورك إلى عمل جديد، دون أن تحصل بالضرورة على مقابل.",
            where: "المادة 2، «المحتوى العام».",
        },
    },
    {
        id: "inputs-outputs",
        related: ["as-is-disclaimer", "royalty-free-license"],
        match: { en: ["AI features", "your inputs"], ar: ["ميزات الذكاء الاصطناعي"] },
        en: {
            term: "Inputs and outputs (AI features)",
            def: "Inputs are what you give an AI feature, such as text or images. Outputs are what it generates from them.",
            why: "Both are treated as your content, and AI outputs may be inaccurate or unsuitable.",
            where: "Section 6, 'AI Features.'",
        },
        ar: {
            term: "المدخلات والمخرجات (ميزات الذكاء الاصطناعي)",
            def: "المدخلات هي ما تقدمه لميزة ذكاء اصطناعي، مثل النصوص أو الصور. والمخرجات هي ما تولّده منها.",
            why: "يُعامل الاثنان كمحتوى يخصك، وقد تكون مخرجات الذكاء الاصطناعي غير دقيقة أو غير مناسبة.",
            where: "المادة 6، «ميزات الذكاء الاصطناعي».",
        },
    },
    {
        id: "third-party-materials",
        related: ["third-party-sharing"],
        match: { en: ["third-party materials", "third-party services"], ar: ["المواد الخارجية"] },
        en: {
            term: "Third-party materials",
            def: "Content, features, or services that come from other companies or people, or links to their sites.",
            why: "Snap isn't responsible for them, and their own terms apply.",
            where: "Section 14.",
        },
        ar: {
            term: "المواد والخدمات الخارجية",
            def: "محتوى أو ميزات أو خدمات تأتي من شركات أو أشخاص آخرين، أو روابط إلى مواقعهم.",
            why: "لا تتحمل Snap مسؤوليتها، وتخضع لشروط تلك الجهات.",
            where: "المادة 14.",
        },
    },
    {
        id: "dmca-notice",
        related: ["public-content", "derivative-works"],
        match: { en: ["DMCA", "copyright notice"], ar: ["إشعار حقوق النشر"] },
        en: {
            term: "Copyright notice (DMCA)",
            def: "A formal request to remove content that infringes copyright. It must include specific details and a statement under penalty of perjury.",
            why: "It's how copyright owners ask Snap to take down material that uses their work.",
            where: "Section 9, 'Respecting Others' Rights.'",
        },
        ar: {
            term: "إشعار حقوق النشر (DMCA)",
            def: "طلب رسمي لإزالة محتوى يتعدى على حقوق النشر، ويجب أن يتضمن تفاصيل محددة وإقراراً تحت طائلة عقوبة شهادة الزور.",
            why: "هكذا يطلب أصحاب حقوق النشر من Snap إزالة المواد التي تستخدم أعمالهم.",
            where: "المادة 9، «احترام حقوق الآخرين».",
        },
    },
];

export const bySlug = (id) => GLOSSARY.find((x) => x.id === id);

// The text to SHOW for an entry in language l.
// Entries whose Arabic is still awaiting review fall back to the English text in the Arabic
// view and are flagged (pending: true) so the UI can add the "AR pending" tag.
export const AR_PENDING_TAG = "AR pending";

export const localized = (x, l) => {
    if (l === "ar" && x.arPending) return { ...x.en, pending: true, lang: "en" };
    return { ...x[l], pending: false, lang: l };
};