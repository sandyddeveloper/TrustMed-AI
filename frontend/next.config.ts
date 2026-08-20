import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["react-plotly.js", "plotly.js-dist-min"],
};

export default nextConfig;
