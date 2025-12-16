/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... your existing config
  webpack: (config) => {
    config.infrastructureLogging = {
      level: 'error',
    };
    return config;
  },
};

module.exports = nextConfig;
export default nextConfig;
