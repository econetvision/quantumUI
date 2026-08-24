import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits .next/standalone — a self-contained server.js with only the traced
  // dependencies. Required by the root Dockerfile; Vercel ignores it.
  output: "standalone",
};

export default nextConfig;
