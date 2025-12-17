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
    return [
      {
        source: '/front/auth/:path*',
        destination: 'https://user-center.ravey.site/front/auth/:path*',
      },
      {
        source: '/front/users/:path*',
        destination: 'https://user-center.ravey.site/front/users/:path*',
      },
      {
        source: '/front/:path*',
        destination: 'https://almond.ravey.site/front/:path*',
      },
    ]
  },
}

export default nextConfig
