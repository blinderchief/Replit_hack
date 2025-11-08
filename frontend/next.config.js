/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress hydration warnings from browser extensions
  reactStrictMode: true,
  
  // Fix workspace root warning for monorepo structure
  outputFileTracingRoot: require('path').join(__dirname, '../'),
  
  // Fix for Clerk chunk loading errors
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Prevent memory issues with webpack cache
    config.cache = {
      type: 'filesystem',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      maxMemoryGenerations: 1, // Reduce memory usage
    };
    
    // Ignore hydration warnings from browser extensions
    config.ignoreWarnings = [
      { module: /node_modules/ },
    ];
    
    return config;
  },
  
  // Optimize chunk loading
  experimental: {
    optimizePackageImports: ['@clerk/nextjs', 'lucide-react', 'framer-motion'],
  },
  
  // Handle external CDN loading for Clerk
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
        ],
      },
    ];
  },
  
  // Proxy API requests to backend (excluding static files)
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8000/api/:path*',
        },
      ],
    };
  },
}

module.exports = nextConfig