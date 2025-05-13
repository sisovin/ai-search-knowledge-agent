/** @type {import('next').NextConfig} */
const withBundleAnalyzer =
  process.env.ANALYZE === "true"
    ? require("@next/bundle-analyzer")({ enabled: true })
    : (config) => config;

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Incremental Static Regeneration (ISR) settings
  images: {
    domains: ["api.exa.ai", "supabase.co"],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Optimize image quality for production
    quality: process.env.NODE_ENV === "production" ? 75 : 90,
  },

  // Middleware configuration
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb", // Increased size limit for larger payloads
    },
    serverComponents: true,
    scrollRestoration: true,
    optimizeCss: true,
    optimizePackageImports: [
      "@headlessui/react",
      "@radix-ui/react-icons",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-slot",
      "@radix-ui/react-toast",
      "react-icons",
      "lucide-react",
      "date-fns",
      "clsx",
      "class-variance-authority",
      "tailwind-merge",
    ],
    instrumentationHook: true, // For custom telemetry/monitoring
  },

  // Production optimizations
  compiler: {
    // Remove console.log in production
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  // Content security policy
  headers: async () => {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' https://api.exa.ai; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.exa.ai https://*.supabase.co; font-src 'self' data:;",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },

  // Custom webpack configuration for AI optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize client-side AI operations
      config.resolve.fallback = {
        fs: false,
        path: false,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
      };
    }
    // Add support for WASM modules if needed
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Production-only optimizations
    if (!dev && !isServer) {
      // Split chunks more aggressively for better caching
      config.optimization.splitChunks = {
        chunks: "all",
        minSize: 20000,
        maxSize: 244000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        automaticNameDelimiter: "~",
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },

  // Environmental configuration
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_EXA_API_KEY: process.env.NEXT_PUBLIC_EXA_API_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // Output configuration
  output: "standalone", // Optimized for containerized deployments

  // For improved performance in production
  poweredByHeader: false,
  compress: true,

  // Control static file generation strategy
  staticPageGenerationTimeout: 120, // Allow more time for complex pages
};

module.exports = withBundleAnalyzer(nextConfig);
