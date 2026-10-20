/** @type {import('next').NextConfig} */
const nextConfig = {
  // cPanel runs the generated .next/standalone/server.js directly.
  output: "standalone",
  // mysql2 uses dynamic requires; keep it outside the server bundle so the
  // standalone trace copies it into node_modules.
  serverExternalPackages: ["mysql2"],
  // The standalone image is built on Windows but runs on Linux. Image
  // optimization is disabled, so do not ship sharp's Windows native binary.
  outputFileTracingExcludes: {
    "*": ["node_modules/sharp/**/*", "node_modules/@img/**/*"],
    "/*": ["node_modules/sharp/**/*", "node_modules/@img/**/*"],
  },
  images: {
    // Shared cPanel hosting should not need sharp/native image binaries.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // First-party proxy for the Meta Pixel loader so basic adblock blocklists
  // don't kill it. Server-side CAPI (/api/events) remains the fallback.
  async rewrites() {
    return [
      {
        source: "/fp/fbevents.js",
        destination: "https://connect.facebook.net/en_US/fbevents.js",
      },
    ];
  },
};

export default nextConfig;
