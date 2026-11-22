"use client";

import ExportSetting from "./ExportSetting";
import SignOutOthersSetting from "./SignOutOthersSetting";
import ClearSavedSetting from "./ClearSavedSetting";

// The three account actions on the Settings tab. Signed-in people only.
export default function SettingsAccountActions() {
    return (
        <>
            <ExportSetting />
            <SignOutOthersSetting />
            <ClearSavedSetting />
        </>
    );
}
