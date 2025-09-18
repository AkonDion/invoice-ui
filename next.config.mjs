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
}

export default nextConfig
