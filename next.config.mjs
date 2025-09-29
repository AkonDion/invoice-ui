/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add timeout configuration
  serverRuntimeConfig: {
    // Increase timeout to 30 seconds
    maxDuration: 30,
  },
  // Increase timeout for server-side rendering
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
    // Add request timeout for API routes
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app'],
    },
  },
  // Suppress console errors in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
  },
  // Disable React strict mode in production to reduce error noise
  reactStrictMode: process.env.NODE_ENV !== 'production',
  // Disable static optimization for invoice pages
  trailingSlash: false,
  // Add headers for cache control
  async headers() {
    return [
      {
        source: '/invoice/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      {
        source: '/api/invoice/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
}

export default nextConfig
