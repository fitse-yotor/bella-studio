import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  typescript: { tsconfigPath: 'tsconfig.vercel.json' },
  webpack(config, { webpack }) {
    config.plugins.push(new webpack.NormalModuleReplacementPlugin(
      /^cloudflare:workers$/, path.resolve('lib/vercel-cloudflare.ts')
    ));
    config.module.rules.push({ resourceQuery: /raw/, type: 'asset/source' });
    return config;
  },
};

export default nextConfig;
