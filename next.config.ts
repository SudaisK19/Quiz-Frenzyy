import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        // Use a broader pattern to allow query params
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
