import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  transpilePackages: ["react-plotly.js", "plotly.js-dist-min"],
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
};

export default nextConfig;
