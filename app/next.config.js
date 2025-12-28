/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/user-center/:path*',
        destination: 'https://user-center.ravey.site/:path*',
      },
      {
        source: '/api/almond-back/:path*',
        destination: 'http://localhost:8082/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/auth',
        destination: '/auth/login',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
