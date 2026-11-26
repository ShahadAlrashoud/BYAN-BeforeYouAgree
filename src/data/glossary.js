// "pdpl: true" terms get a PDPL badge. Have a legal reviewer confirm the pdplNote wording.
//
// "arPending: true" means the Arabic text has NOT been approved by a native speaker yet.
// Such entries keep ar: { term: "", def: "" } here on purpose: this file is bundled into the
// browser, so unreviewed Arabic must not live in it. The Arabic view shows the English text
// with an "AR pending" tag instead (see localized() below). The Arabic drafts are in
// docs/glossary-ar-pending.md. When approved: paste the Arabic into ar, delete arPending,
// and add the Arabic phrases to match.ar.

export const GLOSSARY = [
    {
        id: "arbitration",
        related: ["class-action-waiver", "governing-law"],
        match: { en: ["arbitration"], ar: ["التحكيم"] },
        en: { term: "Arbitration", def: "A private process where a neutral person, not a court, settles disputes. The arbitrator is selected as stated in the policy. You give up the right to sue in court.", example: "“Any dispute will be resolved through binding arbitration.”" },
        ar: { term: "التحكيم", def: "عملية خاصة يفصل فيها طرف محايد في النزاع بدلاً من المحكمة. غالباً تتنازل فيها عن حقك في رفع دعوى أمام القضاء.", example: "«تُحل أي نزاعات عن طريق التحكيم الملزم.»" },
    },
    {
        id: "class-action-waiver",
        related: ["arbitration", "limitation-of-liability"],
        match: { en: ["class action"], ar: ["الدعاوى الجماعية", "دعوى جماعية"] },
        en: { term: "Class action waiver", def: "A clause stopping you from joining other users in a group lawsuit against the company.", example: "“You waive your right to participate in a class action.”" },
        ar: { term: "التنازل عن الدعاوى الجماعية", def: "بند يمنعك من الانضمام إلى مستخدمين آخرين في دعوى جماعية ضد الشركة.", example: "«تتنازل عن حقك في المشاركة في أي دعوى جماعية.»" },
    },
    {
        id: "cookies",
        related: ["personal-data", "third-party-sharing"],
        match: { en: ["cookies", "trackers"], ar: ["ملفات تعريف الارتباط", "الكوكيز"] },
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
        match: { en: ["indemnify", "indemnification"], ar: ["التعويض"] },
        en: { term: "Indemnification", def: "A promise to compensate the company for its losses or legal costs if your actions lead to a claim against it.", example: "“You agree to indemnify us against any claims arising from your content.”" },
        ar: { term: "التعويض", def: "تعهد بتغطية خسائر الشركة أو تكاليفها القانونية إذا تسببت أفعالك في مطالبة ضدها.", example: "«توافق على تعويضنا عن أي مطالبات ناشئة عن محتواك.»" },
    },
    {
        id: "limitation-of-liability",
        related: ["indemnification", "arbitration"],
        match: { en: ["not liable", "limitation of liability"], ar: ["تحديد المسؤولية", "غير مسؤولين"] },
        en: { term: "Limitation of liability", def: "A clause capping or excluding what the company must pay you if something goes wrong.", example: "“We are not liable for any damages arising from your use of the service.”" },
        ar: { term: "تحديد المسؤولية", def: "بند يحدد أو يستثني ما يتعين على الشركة دفعه لك إذا حدث خطأ ما.", example: "«لا نتحمل المسؤولية عن أي أضرار ناتجة عن استخدامك للخدمة.»" },
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
        related: ["arbitration", "unilateral-changes"],
        match: { en: ["governed by the laws", "governing law"], ar: ["القانون الواجب التطبيق", "تخضع لقوانين"] },
        en: { term: "Governing law", def: "The country or state whose laws apply to any dispute. It may be far from where you live.", example: "“These terms are governed by the laws of a jurisdiction of our choosing.”" },
        ar: { term: "القانون الواجب التطبيق", def: "قانون الدولة أو الولاية الذي يُطبَّق على أي نزاع، وقد يكون بعيداً عن مكان إقامتك.", example: "«تخضع هذه الشروط لقوانين الجهة التي نختارها.»" },
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
        arPending: true,
        related: ["cookies", "third-party-sharing"],
        match: { en: ["tracking", "trackers"], ar: [] },
        en: { term: "Tracking", def: "Following your activity across websites or apps.", example: "“We track your activity across sites.”" },
        ar: { term: "", def: "" },
    },
    {
        id: "advertising",
        arPending: true,
        related: ["third-party-sharing"],
        match: { en: ["advertising", "ads"], ar: [] },
        en: { term: "Advertising", def: "Showing ads based on your data or activity.", example: "“We may show you ads based on your data.”" },
        ar: { term: "", def: "" },
    },
    {
        id: "consent",
        arPending: true,
        related: ["opt-out"],
        match: { en: ["consent"], ar: [] },
        en: { term: "Consent", def: "Your agreement to a company collecting or using your data.", example: "“By continuing, you consent to our use of cookies.”" },
        ar: { term: "", def: "" },
    },
    {
        id: "data-broker",
        arPending: true,
        related: ["third-party-sharing", "personal-data"],
        match: { en: ["data broker", "data brokers"], ar: [] },
        en: { term: "Data broker", def: "A company that collects personal information from many sources and sells it to other companies." },
        ar: { term: "", def: "" },
    },
    {
        id: "telemetry",
        arPending: true,
        related: ["personal-data", "cookies"],
        match: { en: ["telemetry"], ar: [] },
        en: { term: "Telemetry", def: "Automatic data a service collects about how you use its software or device.", example: "“We collect usage data to improve performance.”" },
        ar: { term: "", def: "" },
    },
    {
        id: "negative-option",
        arPending: true,
        related: ["automatic-renewal", "opt-out"],
        match: { en: ["negative option"], ar: [] },
        en: { term: "Negative option", def: "A clause that treats your silence or continued use as agreement, such as an automatic renewal." },
        ar: { term: "", def: "" },
    },

    // NEW ENTRIES
    // Arabic translations are intentionally pending native-speaker review.

    {
        id: "data-subject-rights",
        arPending: true,
        related: ["personal-data", "consent", "data-portability", "consent-withdrawal"],
        match: { en: ["data subject rights", "rights of data subjects"], ar: [] },
        en: { term: "Data subject rights", def: "The rights a person may have over their personal data, such as requesting access, correction, or deletion where applicable under the law.", example: "“You may request access to or correction of your personal data.”" },
        ar: { term: "", def: "" },
    },
    {
        id: "data-processing",
        arPending: true,
        related: ["data-controller", "data-processor", "personal-data", "lawful-basis"],
        match: { en: ["data processing", "processing of personal data"], ar: [] },
        en: { term: "Data processing", def: "Any action performed on personal data, such as collecting, recording, organizing, storing, using, sharing, or deleting it.", example: "“We process your information to provide and maintain the service.”" },
        ar: { term: "", def: "" },
    },
    {
        id: "lawful-basis",
        arPending: true,
        related: ["consent", "data-processing", "purpose-limitation"],
        match: { en: ["lawful basis", "legal basis for processing"], ar: [] },
        en: { term: "Lawful basis", def: "The legal reason an organization relies on to process personal data. Consent may be one basis, but it is not the only possible one.", example: "“We process this information where we have a lawful basis to do so.”" },
        ar: { term: "", def: "" },
    },
    {
        id: "purpose-limitation",
        arPending: true,
        related: ["data-minimization", "lawful-basis", "data-processing"],
        match: { en: ["purpose limitation", "specified purposes"], ar: [] },
        en: { term: "Purpose limitation", def: "The principle that personal data should be collected for clear purposes and not used in ways that are incompatible with those purposes.", example: "“We use the information for the purposes explained when it was collected.”" },
        ar: { term: "", def: "" },
    },
    {
        id: "data-minimization",
        arPending: true,
        related: ["purpose-limitation", "personal-data", "data-processing"],
        match: { en: ["data minimization", "data minimisation", "minimum amount of data"], ar: [] },
        en: { term: "Data minimization", def: "The principle of collecting and using only the personal data that is necessary for a specific purpose.", example: "“We only request the information needed to create your account.”" },
        ar: { term: "", def: "" },
    },
    {
        id: "cross-border-data-transfer",
        arPending: true,
        related: ["personal-data", "data-controller", "data-processor"],
        match: { en: ["cross-border data transfer", "international data transfer", "transfer data overseas"], ar: [] },
        en: { term: "Cross-border data transfer", def: "Sending personal data to, or making it accessible in, another country. Additional legal requirements may apply depending on the countries and circumstances.", example: "“Your information may be transferred to service providers in other countries.”" },
        ar: { term: "", def: "" },
    },
    {
        id: "consent-withdrawal",
        arPending: true,
        related: ["consent", "data-subject-rights", "opt-out"],
        match: { en: ["withdraw consent", "withdrawal of consent", "consent withdrawal"], ar: [] },
        en: { term: "Consent withdrawal", def: "Taking back permission you previously gave for a particular use of your personal data. Withdrawal may not affect processing that was lawful before you withdrew consent.", example: "“You can withdraw your consent at any time through your account settings.”" },
        ar: { term: "", def: "" },
    },
    {
        id: "data-portability",
        arPending: true,
        related: ["data-subject-rights", "personal-data"],
        match: { en: ["data portability", "portable copy of your data"], ar: [] },
        en: { term: "Data portability", def: "The ability, where provided by applicable law, to receive certain personal data in a usable format and sometimes transfer it to another organization.", example: "“You may request a copy of eligible account data in a downloadable format.”" },
        ar: { term: "", def: "" },
    },
    {
        id: "profiling",
        arPending: true,
        related: ["personal-data", "behavioral-advertising", "automated-decision-making"],
        match: { en: ["profiling", "profile you", "build a profile"], ar: [] },
        en: { term: "Profiling", def: "Using personal data to analyze or predict things about a person, such as their interests, preferences, behavior, or likely choices.", example: "“We may use your activity to build a profile of your interests.”" },
        ar: { term: "", def: "" },
    },
    {
        id: "behavioral-advertising",
        arPending: true,
        related: ["advertising", "tracking", "profiling", "cookies"],
        match: { en: ["behavioral advertising", "behavioural advertising", "interest-based advertising"], ar: [] },
        en: { term: "Behavioral advertising", def: "Advertising selected or personalized based on information about your activity, interests, or behavior, often collected over time.", example: "“We use browsing activity to show interest-based ads.”" },
        ar: { term: "", def: "" },
    },
    {
        id: "device-fingerprinting",
        arPending: true,
        related: ["tracking", "cookies", "personal-data"],
        match: { en: ["device fingerprinting", "browser fingerprinting", "digital fingerprint"], ar: [] },
        en: { term: "Device fingerprinting", def: "A technique that combines details about your device or browser, such as settings and technical characteristics, to recognize it or distinguish it from other devices.", example: "“We may use device characteristics to help recognize returning visitors.”" },
        ar: { term: "", def: "" },
    },
    {
        id: "termination",
        arPending: true,
        related: ["suspension", "automatic-renewal", "unilateral-changes"],
        match: { en: ["termination", "terminate this agreement", "terminate your account"], ar: [] },
        en: { term: "Termination", def: "Ending an agreement or service. The terms may explain when you or the company can end it and what happens afterward.", example: "“Either party may terminate this agreement by giving written notice.”" },
        ar: { term: "", def: "" },
    },
    {
        id: "suspension",
        arPending: true,
        related: ["termination", "unilateral-changes"],
        match: { en: ["suspension", "suspend your account", "suspend access"], ar: [] },
        en: { term: "Suspension", def: "A temporary restriction on your account or access to a service, often because of suspected rule violations, security concerns, or non-payment.", example: "“We may suspend access if we detect activity that violates these terms.”" },
        ar: { term: "", def: "" },
    },
    {
        id: "license-agreement",
        arPending: true,
        related: ["intellectual-property-rights", "termination"],
        match: { en: ["license agreement", "software license", "licence agreement"], ar: [] },
        en: { term: "License agreement", def: "An agreement that gives you permission to use software, content, or another product under stated conditions. It usually does not mean you own it.", example: "“We grant you a limited, non-transferable license to use the app.”" },
        ar: { term: "", def: "" },
    },
    {
        id: "subprocessor",
        arPending: true,
        related: ["data-processor", "data-controller", "third-party-sharing"],
        match: { en: ["subprocessor", "sub-processors", "sub-processor"], ar: [] },
        en: { term: "Subprocessor", def: "A third party engaged by a data processor to help process personal data on behalf of the organization responsible for it.", example: "“Our hosting provider may use subprocessors to support the service.”" },
        ar: { term: "", def: "" },
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