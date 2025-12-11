import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/resume',
        destination: '/assets/shreyas_deb_resume.pdf',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
