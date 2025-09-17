import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/patient',
        permanent: true,
      },
    ];
  },
  env:{
    NEXT_PUBLIC_MODMED_BASE_URL:process.env.NEXT_PUBLIC_MODMED_BASE_URL,
    NEXT_PUBLIC_MODMED_FIRM_PREFIX:process.env.NEXT_PUBLIC_MODMED_FIRM_PREFIX,
    NEXT_PUBLIC_MODMED_API_KEY:process.env.NEXT_PUBLIC_MODMED_API_KEY,
    NEXT_PUBLIC_MODMED_USERNAME:process.env.NEXT_PUBLIC_MODMED_USERNAME,
    NEXT_PUBLIC_MODMED_PASSWORD:process.env.NEXT_PUBLIC_MODMED_PASSWORD
  }
};

export default nextConfig;
