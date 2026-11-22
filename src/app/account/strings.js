// All visible strings for the Account area (menu, tabs, Profile, Settings, dialogs).
// Every string has English (en) and Arabic (ar).
// [AR review pending] every Arabic string in the strings*.js files must be approved by a native speaker.
// [PRIVACY TEAM: confirm] items are marked where they appear.
import { shell, profile } from "./stringsA";
import { settings, language } from "./stringsB";
import { dialogs } from "./stringsC";

export const S = {
    en: { ...shell.en, ...profile.en, ...settings.en, ...language.en, ...dialogs.en },
    ar: { ...shell.ar, ...profile.ar, ...settings.ar, ...language.ar, ...dialogs.ar },
};
