import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Account v2 (feature flag NEXT_PUBLIC_ACCOUNT_V2, default off): the old URLs move to the new tabs.
  // These redirects exist only while the flag is on, so nothing changes while it is off.
  async redirects() {
    if (process.env.NEXT_PUBLIC_ACCOUNT_V2 !== "true") return [];
    return [
      { source: "/settings", destination: "/account/settings", permanent: false },
      { source: "/profile", destination: "/account/profile", permanent: false },
      { source: "/ar/settings", destination: "/account/settings", permanent: false },
      { source: "/ar/profile", destination: "/account/profile", permanent: false },
    ];
  },
};

export default nextConfig;
