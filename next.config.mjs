/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static, client-interactive site — exports to ./out for deploy
  // on Vercel or Cloudflare Pages with zero server runtime.
  output: "export",
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
