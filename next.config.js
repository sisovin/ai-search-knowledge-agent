/** @type {import('next').NextConfig} */
const withBundleAnalyzer =
  process.env.ANALYZE === "true"
    ? require("@next/bundle-analyzer")({ enabled: true })
    : (config) => config;

const nextConfig = {
  reactStrictMode: true,
  // Incremental Static Regeneration (ISR) settings
  images: {
    domains: ["api.exa.ai", "supabase.co"],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Server External Packages - moved from experimental
  serverExternalPackages: [],

  // Middleware configuration
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb", // Increased size limit for larger payloads
      allowedOrigins: ["localhost:3000"], // Add your allowed origins
    },
    scrollRestoration: true,
    optimizeCss: true,
    // Increase timeout for server operations
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

  // Increase server timeout to prevent premature connection closures
  serverRuntimeConfig: {
    // Will only be available on the server side
    responseTimeout: 60000, // 60 seconds
  },

  // Help with React Server Component connections
  poweredByHeader: false,
  compress: true,

  // Control static file generation strategy
  staticPageGenerationTimeout: 120, // Allow more time for complex pages
};

module.exports = withBundleAnalyzer(nextConfig);
