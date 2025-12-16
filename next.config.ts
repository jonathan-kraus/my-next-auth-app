/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // Suppress Babel deoptimisation warnings
    config.infrastructureLogging = {
      level: 'error', // only show errors, hide warnings
    };
    return config;
  },
};

export default nextConfig;
