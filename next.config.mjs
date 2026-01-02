/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const userCenterUrl = (process.env.NEXT_PUBLIC_USER_CENTER_URL || 'https://user-center.ravey.site').replace(/\/$/, '');
    const almondBackUrl = (process.env.NEXT_PUBLIC_ALMOND_BACK_URL || 'http://localhost:8082').replace(/\/$/, '');
    return [
      {
        source: '/front/auth/:path*',
        destination: `${userCenterUrl}/front/auth/:path*`,
      },
      {
        source: '/front/users/:path*',
        destination: `${userCenterUrl}/front/users/:path*`,
      },
      {
        source: '/front/:path*',
        destination: `${almondBackUrl}/front/:path*`,
      },
    ]
  },
}

export default nextConfig
