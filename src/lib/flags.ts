// Feature flag for the restructured account area ("Account v2"):
//   - one "Account" entry in the header, with an accessible avatar menu
//   - /account/profile and /account/settings as two tabs of one Account page
//   - real settings, export, sign out of all devices, clear saved results
//   - email change with verification, display name, two-step account deletion
//
// DEFAULT: OFF. To turn it on, set NEXT_PUBLIC_ACCOUNT_V2=true and rebuild
// (NEXT_PUBLIC_* values are fixed at build time). Run migrations/001_account_v2.sql first.
export const ACCOUNT_V2 = process.env.NEXT_PUBLIC_ACCOUNT_V2 === "true";
