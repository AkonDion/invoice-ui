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
  // Increase timeout for server-side rendering
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  // Add timeout configuration
  serverRuntimeConfig: {
    // Increase timeout to 30 seconds
    maxDuration: 30,
  },
  // Suppress console errors in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
  },
  // Disable React strict mode in production to reduce error noise
  reactStrictMode: process.env.NODE_ENV !== 'production',
}

export default nextConfig
