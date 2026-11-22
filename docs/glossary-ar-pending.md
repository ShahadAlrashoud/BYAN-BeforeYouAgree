# Glossary: Arabic drafts awaiting native-speaker review

**Status: [AR review pending]. Do NOT publish.**

These drafts are deliberately kept out of `src/data/glossary.js`, because that file is bundled
into the browser. Until a native speaker approves them, the Arabic glossary shows the English
text with an "[AR review pending]" tag for these terms.

## How to publish an approved entry
In `src/data/glossary.js`, for the matching entry:
1. Paste the approved Arabic into `ar: { term, def }`.
2. Delete the `arPending: true` line.
3. Add the Arabic phrases to `match.ar` so the term is auto-linked in Arabic text.

## New entries (draft Arabic)

| id | English term | Draft Arabic term | Draft Arabic definition |
|----|--------------|-------------------|-------------------------|
| `data-broker` | Data broker | وسيط البيانات | شركة تجمع معلومات شخصية من مصادر متعددة وتبيعها لشركات أخرى. |
| `telemetry` | Telemetry | القياس عن بُعد (Telemetry) | بيانات تجمعها الخدمة تلقائياً عن كيفية استخدامك لبرنامجها أو جهازها. |
| `negative-option` | Negative option | الخيار السلبي (الموافقة الضمنية) | بند يعتبر صمتك أو استمرارك في الاستخدام موافقة، مثل التجديد التلقائي. |

Reviewer questions:
- Is "القياس عن بُعد" the term readers will recognise for telemetry, or is "التتبع التلقائي للاستخدام" clearer?
- Is "الخيار السلبي" an accepted legal term, or should the entry use only "الموافقة الضمنية"?

## Existing entries: requested wording differs from what is live

These five were already in the glossary, with approved Arabic. They have NOT been changed.
If the requested English wording should replace them, their Arabic needs re-review too.

| id | Live English definition | Requested English definition |
|----|-------------------------|------------------------------|
| `automatic-renewal` | A subscription that renews and charges you again each period unless you cancel in time. | A subscription that renews on its own at the end of each period unless you cancel it. |
| `governing-law` | The country or state whose laws apply to any dispute. It may be far from where you live. | The country's laws that decide how a dispute under the terms is handled. |
| `sensitive-data` (PDPL) | Personal data that could harm you if misused, such as health, religion, biometrics or financial details. | Personal information that needs extra protection, such as health details, religion, or financial information. |
| `data-breach` (PDPL) | When personal data is accessed, leaked or stolen by someone who shouldn't have it. | An incident where personal data is accessed, lost, or shared without permission. |
| `opt-out` | Your ability to say no to something that is on by default, such as marketing or data sharing. | A choice to stop a use of your data, such as marketing or sharing, usually through a settings page or a request. |
