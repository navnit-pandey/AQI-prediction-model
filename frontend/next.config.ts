import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Proxy /api/* requests to the Flask backend during development.
   * This avoids CORS issues and keeps frontend/backend on separate ports.
   * Flask runs on port 5000, Next.js on port 3000.
   */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
