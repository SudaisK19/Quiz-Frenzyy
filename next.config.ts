import type { NextConfig } from "next";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const nextConfig: NextConfig = {
  env: {
    MONGO_URI: process.env.MONGO_URI,
    TOKEN_SECRET: process.env.TOKEN_SECRET,
    DOMAIN: process.env.DOMAIN,
  },
};

export default nextConfig;
