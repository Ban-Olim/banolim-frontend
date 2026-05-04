import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
    if (!backendUrl) return [];
    return [
      {
        source: "/oauth2/:path*",
        destination: `${backendUrl}/oauth2/:path*`,
      },
      {
        source: "/login/oauth2/:path*",
        destination: `${backendUrl}/login/oauth2/:path*`,
      },
    ];
  },
};

export default nextConfig;
