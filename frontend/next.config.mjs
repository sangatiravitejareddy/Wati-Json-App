/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://187.127.149.65:8001/api/:path*',
      },
    ];
  },
};

export default nextConfig;
