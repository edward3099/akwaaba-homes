/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🚀🚀🚀 CACHE BUST - FORCE VERCEL REBUILD 🚀🚀🚀
  // Add timestamp to force cache invalidation
  generateBuildId: async () => {
    return `build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Remove the ignoreBuildErrors setting to see actual TypeScript errors
    // ignoreBuildErrors: true,
  },
  // Fix ChunkLoadError by improving module loading
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
    webpackBuildWorker: false,
  },
  // Improve chunk loading
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize chunk splitting for production
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }
    return config;
  },
  // Improve image loading with proper configuration
  images: {
    loader: 'custom',
    loaderFile: './src/lib/supabase-image-loader.ts',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
        port: '',
        pathname: '/**',
      },
      // Add Supabase storage domain for image transformations
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/render/image/public/**',
      },
      // Add any other external image domains you need
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: false,
  },
  // Improve build performance
  compress: true,
  poweredByHeader: false,
  // 🚀🚀🚀 CACHE BUST - FORCE CDN CACHE INVALIDATION 🚀🚀🚀
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
}

export default nextConfig
