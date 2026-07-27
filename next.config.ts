import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Pin the workspace root to this directory.
   *
   * There is a stray, empty `package-lock.json` one level up in D:\projects,
   * and Turbopack's root inference picks the OUTERMOST lockfile it can find —
   * so it was resolving the root to the parent folder and warning on every
   * start. Root drives module resolution and which .env files are read, so
   * getting it wrong is not only noise.
   */
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
