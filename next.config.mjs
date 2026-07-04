// Subpath hosting (GitHub Pages serves at /<repo>/): set PAGES_BASE_PATH and
// NEXT_PUBLIC_BASE_PATH to e.g. "/Ahmad-qattan" at build time. Empty = root
// (Vercel / Cloudflare / any root-domain host).
const basePath = process.env.PAGES_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static, client-interactive site — exports to ./out for deploy
  // on Vercel or Cloudflare Pages with zero server runtime.
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    // Required when using next/image with `output: export`. We avoid raster
    // images entirely (the design is type + SVG + CSS), but this keeps the
    // door open without breaking the static export.
    unoptimized: true,
  },
};

export default nextConfig;
