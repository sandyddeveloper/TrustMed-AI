import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  transpilePackages: ["react-plotly.js", "plotly.js-dist-min"],
  turbopack: {},
};

export default nextConfig;
