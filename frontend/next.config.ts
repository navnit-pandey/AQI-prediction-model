import type { NextConfig } from "next";

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const nextConfig: NextConfig = {
  /**
   * Proxy /api/* requests to the Flask backend.
   * Uses environment variable NEXT_PUBLIC_BACKEND_URL when deployed,
   * otherwise defaults to localhost:5000 for local development.
   */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${NEXT_PUBLIC_BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
