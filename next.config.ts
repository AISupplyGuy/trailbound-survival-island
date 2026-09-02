import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  agentRules: false,
  allowedDevOrigins: ["10.0.0.76", "127.0.0.1"],
};

export default nextConfig;
