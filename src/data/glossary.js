// "pdpl: true" terms get a PDPL badge. Have a legal reviewer confirm the pdplNote wording.
//
// "arPending: true" means the Arabic text has NOT been approved by a native speaker yet.
// Such entries keep ar: { term: "", def: "" } here on purpose: this file is bundled into the
// browser, so unreviewed Arabic must not live in it. The Arabic view shows the English text
// with an "" tag instead (see localized() below). The Arabic drafts are in
// docs/glossary-ar-pending.md. When approved: paste the Arabic into ar, delete arPending,
// and add the Arabic phrases to match.ar.
export const GLOSSARY = [
    {
        id: "arbitration",
        related: ["class-action-waiver", "governing-law"],
        match: { en: ["arbitration"], ar: ["التحكيم"] },
        en: { term: "Arbitration", def: "A private process where a neutral person, not a court, settles disputes. You usually give up the right to sue in court.", example: "“Any dispute will be resolved through binding arbitration.”" },
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
        en: { term: "Cookies", def: "Small files saved in your browser that remember you, keep you logged in, or track your activity." },
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
        en: { term: "Data retention", def: "How long a company keeps your data before deleting it.", example: "“We retain your information for as long as necessary.” (vague: no fixed period)" },
        ar: { term: "الاحتفاظ بالبيانات", def: "المدة التي تحتفظ فيها الشركة ببياناتك قبل حذفها.", example: "«نحتفظ بمعلوماتك للمدة اللازمة.» (غامض: لا توجد مدة محددة)" },
    },
    {
        id: "indemnification",
        related: ["limitation-of-liability"],
        match: { en: ["indemnify", "indemnification"], ar: ["التعويض"] },
        en: { term: "Indemnification", def: "A promise to cover the company's losses or legal costs if your actions cause a claim against it.", example: "“You agree to indemnify us against any claims arising from your content.”" },
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
        en: { term: "Sensitive data", def: "Personal data that could harm you if misused, such as health, religion, biometrics or financial details.", example: "“We may collect biometric information to verify your identity.”" },
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
        en: { term: "Opt-out", def: "Your ability to say no to something that is on by default, such as marketing or data sharing.", example: "“You may opt out of marketing emails at any time.”" },
        ar: { term: "الانسحاب (Opt-out)", def: "قدرتك على رفض أمر مفعّل افتراضياً، مثل الرسائل التسويقية أو مشاركة البيانات.", example: "«يمكنك الانسحاب من الرسائل التسويقية في أي وقت.»" },
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
        en: { term: "Telemetry", def: "Automatic data a service collects about how you use its software or device." },
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
];

export const bySlug = (id) => GLOSSARY.find((x) => x.id === id);

// The text to SHOW for an entry in language l.
// Entries whose Arabic is still awaiting review fall back to the English text in the Arabic
// view and are flagged (pending: true) so the UI can add the "" tag.
export const AR_PENDING_TAG = "";

export const localized = (x, l) => {
    if (l === "ar" && x.arPending) return { ...x.en, pending: true, lang: "en" };
    return { ...x[l], pending: false, lang: l };
};