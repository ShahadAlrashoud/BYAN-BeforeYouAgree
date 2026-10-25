<p align="center">
<img width="500" height="500" alt="privacy-check-logo-transparent" src="https://github.com/user-attachments/assets/a8a208b6-f5e6-484c-baa9-b967c5ae4b2c" />   
</p>


# BYAN – Before You Agree

> Know your rights. Understand your terms.

BYAN (formerly PrivacyCheck) is a web app that analyzes a website's Terms of Service and Privacy Policy. It extracts the important clauses, gives a 0–100 risk score, and writes a short summary in English or Arabic. It is our graduation project.

**Live demo:** www.byan.website

## Features

- **URL analysis:** paste a website link and the app fetches and reads the policy text.
- **Screenshot analysis:** upload up to 10 screenshots of a policy. Text is read in English and Arabic with Tesseract.js (OCR).
- **Risk scoring:** a 0–100 score with Safe / Moderate Risk / High Risk levels.
- **Clause detection:** data collection, third-party sharing (flagged as PDPL-related), data retention and limits on user rights.
- **AI summaries:** Groq (`gpt-oss-120b`) returns structured JSON, with a keyword-based fallback if the AI fails.
- **Comparison:** compare two websites side by side on the results page.
- **Accounts:** sign up and log in, then save, sort and delete your analyses.
- **Arabic / English:** automatic language detection, translation route, RTL layout.
- **Light / dark mode:** theme saved in the browser.
- **Contact form:** sends e-mail through Resend, with a confirmation e-mail to the visitor.
- **Info pages:** About, How It Works, FAQ, Disclaimer and Contact.

## Tech Stack

| Area | Technology |
|---|---|
| Framework | Next.js 16.3.4, React 19.2.8 (TypeScript) |
| Database | Neon (serverless Postgres), `@neondatabase/serverless` |
| AI | Groq API, `gpt-oss-120b` |
| OCR | Tesseract.js |
| Authentication | NextAuth, bcryptjs |
| E-mail | Resend, Nodemailer |
| Hosting | Vercel |


## Testing

[No automated tests are in the repository yet.]

Manual checks:
1. Enter an invalid URL and confirm that an error message appears.
2. Analyze a valid privacy policy URL and confirm that the score, summary and clauses appear.
3. Upload a screenshot and confirm that the text is analyzed.
4. Switch between English and Arabic and confirm that the layout is RTL in Arabic.
5. Submit the contact form and confirm that both e-mails arrive.

## Project Structure

## Team

| Member | Role |
|---|---|
| Shahad Alrashoud | Team lead, AI and analysis engine, project management |
| Gadah Almutairi | Front end |
| Nourah Almudbil | Back end |

**Supervisor:**  Dr. Nisreen Innab

## Screenshots
<img width="1123" height="646" alt="image" src="https://github.com/user-attachments/assets/4b618096-b85d-49cd-bab4-a78f7f1637d1" /> homepage

[screenshots: results page, comparison, screenshot upload, Arabic/dark mode.]

## Disclaimer

BYAN gives automated, informational summaries and is not legal advice.



