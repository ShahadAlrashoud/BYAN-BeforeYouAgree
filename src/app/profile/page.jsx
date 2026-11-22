"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useTheme } from "../providers";
import DeleteAccountDialog from "../components/DeleteAccountDialog";

const content = {
  en: {
    title: "Profile",
    username: "Username",
    email: "Email",
    userId: "User ID",
    notSet: "N/A",
    loading: "Loading...",
    needAccount: "Your profile is available after you save an analysis.",
    backHome: "Back to Homepage",
    dangerTitle: "Danger zone",
    dangerText: "Deleting your account permanently removes your profile, your sign-in details and all of your saved analysis results. This cannot be undone.",
    deleteButton: "Delete account",
    doneTitle: "Your account has been deleted",
    doneText: "Your profile, sign-in details and saved analysis results have been permanently deleted, and you have been signed out on all devices.",
    doneEmail: (email) => `We've sent a confirmation email to ${email}.`,
    doneNoEmail: "We couldn't send the confirmation email, but your account has been deleted.",
  },
  ar: {
    title: "الملف الشخصي",
    username: "اسم المستخدم",
    email: "البريد الإلكتروني",
    userId: "رقم المستخدم",
    notSet: "غير متوفر",
    loading: "جارٍ التحميل...",
    needAccount: "يظهر ملفك الشخصي بعد أن تحفظ تحليلًا.",
    backHome: "العودة إلى الصفحة الرئيسية",
    dangerTitle: "منطقة الخطر",
    dangerText: "حذف حسابك يزيل نهائيًا ملفك الشخصي وبيانات تسجيل الدخول وجميع نتائج التحليل المحفوظة. لا يمكن التراجع عن ذلك.",
    deleteButton: "حذف الحساب",
    doneTitle: "تم حذف حسابك",
    doneText: "تم حذف ملفك الشخصي وبيانات تسجيل الدخول ونتائج التحليل المحفوظة نهائيًا، وتم تسجيل خروجك من جميع الأجهزة.",
    doneEmail: (email) => `أرسلنا رسالة تأكيد إلى ${email}.`,
    doneNoEmail: "تعذّر إرسال رسالة التأكيد، لكن تم حذف حسابك.",
  },
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { theme, lang } = useTheme();
  const isAr = lang === "ar";
  const isDark = theme === "dark";
  const t = content[lang];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleted, setDeleted] = useState(null); // { email, emailSent } once the account is gone
  const doneRef = useRef(null);

  // Move focus to the final message so screen readers announce it
  useEffect(() => {
    if (deleted) doneRef.current?.focus();
  }, [deleted]);

  const danger = isDark ? "#f87171" : "#b91c1c";

  async function handleDeleted({ emailSent }) {
    const deletedEmail = session?.user?.email;
    setDialogOpen(false);
    setDeleted({ email: deletedEmail, emailSent });
    // Clear this browser's session cookie. Other devices are signed out
    // automatically because their next session check finds the user no longer exists.
    try {
      await signOut({ redirect: false });
    } catch {
      /* the account is already deleted; the session is invalid anyway */
    }
  }

  // Final confirmation (still shown after the session is gone)
  if (deleted) {
    return (
      <div dir={isAr ? "rtl" : "ltr"} style={{ maxWidth: 700, margin: "20px auto", padding: "0 16px" }}>
        <div
          ref={doneRef}
          tabIndex={-1}
          role="status"
          style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, outline: "none" }}
        >
          <h1 style={{ marginTop: 0 }}>{t.doneTitle}</h1>
          <p>{t.doneText}</p>
          <p>{deleted.emailSent ? t.doneEmail(deleted.email) : t.doneNoEmail}</p>
          <p>
            <Link href="/">{t.backHome}</Link>
          </p>
        </div>
      </div>
    );
  }

  if (status === "loading") return <div style={{ padding: 20 }}>{t.loading}</div>;

  if (!session?.user) {
    return (
      <div dir={isAr ? "rtl" : "ltr"} style={{ padding: 20 }}>
        {t.needAccount} <Link href="/">{t.backHome}</Link>
      </div>
    );
  }

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      style={{ maxWidth: 700, margin: "20px auto", padding: "0 16px" }}
    >
      <h1>{t.title}</h1>
      <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
        <p><b>{t.username}:</b> {session.user.username || t.notSet}</p>
        <p><b>{t.email}:</b> {session.user.email}</p>
        <p><b>{t.userId}:</b> {session.user.id}</p>
      </div>

      {/* Danger zone: kept separate from the profile details above */}
      <section
        aria-labelledby="byan-danger-title"
        style={{ marginTop: 48, padding: 18, border: `2px solid ${danger}`, borderRadius: 12 }}
      >
        <h2 id="byan-danger-title" style={{ margin: "0 0 8px", fontSize: "1.1rem", color: danger }}>
          {t.dangerTitle}
        </h2>
        <p style={{ margin: "0 0 14px", lineHeight: 1.6 }}>{t.dangerText}</p>
        <button
          type="button"
          className="byan-danger-btn"
          onClick={() => setDialogOpen(true)}
          aria-haspopup="dialog"
          style={{
            minHeight: 44,
            padding: "10px 20px",
            borderRadius: 10,
            border: `2px solid ${danger}`,
            background: "transparent",
            color: danger,
            fontWeight: 800,
            fontSize: "0.92rem",
            cursor: "pointer",
          }}
        >
          {t.deleteButton}
        </button>
      </section>

      <DeleteAccountDialog
        open={dialogOpen}
        email={session.user.email}
        onClose={() => setDialogOpen(false)}
        onDeleted={handleDeleted}
      />
    </div>
  );
}