import type { NextConfig } from "next";

const nextConfig = {
  // ... your existing config
  webpack: (config) => {
    config.infrastructureLogging = {
      level: "error",
    };
    return config;
  },
};
export default nextConfig;
