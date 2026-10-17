/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
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