/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@ats/shared-types',
    '@ats/resume-schema',
    '@ats/template-registry',
    '@ats/resume-renderer',
  ],
  async rewrites() {
    const rawApiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const backendUrl = rawApiUrl.replace(/\/api(\/v1)?\/?$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
