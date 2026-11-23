"use client";

import { createContext, useContext, type ReactNode } from "react";

// Server flags that client components need. The server layout reads them per request (call time, no rebuild)
// and passes them in, so a client page never decides a flag on its own. All defaults are "off".
export type ClientFlags = {
    newHome: boolean; // NEW_HOME: /analyze input page and every results-page change
    dailyAllowance: boolean; // DAILY_ALLOWANCE: the 1-analysis-per-day limit exists
    cacheTtlDays: number; // CACHE_TTL_DAYS: a cached result older than this may be re-run
};

const FlagsContext = createContext<ClientFlags>({ newHome: false, dailyAllowance: false, cacheTtlDays: 7 });

export const useFlags = () => useContext(FlagsContext);

export default function FlagsProvider({ value, children }: { value: ClientFlags; children: ReactNode }) {
    return <FlagsContext.Provider value={value}>{children}</FlagsContext.Provider>;
}
