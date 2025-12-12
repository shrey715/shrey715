import type { NextConfig } from "next";
import createMDX from "@next/mdx";

// Set STATIC_EXPORT=true to generate static HTML for college forum
const isStaticExport = process.env.STATIC_EXPORT === 'true';

const nextConfig: NextConfig = {
  ...(isStaticExport && {
    output: 'export',
    images: { unoptimized: true },
  }),
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  ...(!isStaticExport && {
    async redirects() {
      return [
        {
          source: '/resume',
          destination: '/assets/shreyas_deb_resume.pdf',
          permanent: false,
        },
      ];
    },
  }),
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
