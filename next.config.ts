import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // ============================================================
  // serverExternalPackages — tells Next.js NOT to bundle these
  // packages with webpack/turbopack. Instead, they are required
  // directly from node_modules at runtime.
  // ============================================================
  // CRITICAL: firebase-admin uses Node.js built-in modules and
  // native dependencies (@google-cloud/firestore, grpc, etc.)
  // that CANNOT be bundled by Next.js. Without this config,
  // production builds crash with 500 error at module load time.
  // ============================================================
  serverExternalPackages: [
    'firebase-admin',
    '@google-cloud/firestore',
    '@google-cloud/storage',
    'google-auth-library',
    'gaxios',
    'grpc',
    'dtrace-provider',
  ],
};

export default nextConfig;
