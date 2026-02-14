/**
 * Bundle Analyzer Configuration
 *
 * To analyze the Next.js bundle:
 *   1. Install: npm install @next/bundle-analyzer
 *   2. Run: ANALYZE=true npm run build
 *
 * This will open an interactive treemap visualization showing
 * bundle sizes for both client and server chunks.
 */

/** @type {import('next').NextConfig} */
const withBundleAnalyzer = (nextConfig) => {
    if (process.env.ANALYZE === "true") {
        try {
            const analyzer = require("@next/bundle-analyzer")({
                enabled: true,
                openAnalyzer: true,
            });
            return analyzer(nextConfig);
        } catch {
            console.warn(
                "[@next/bundle-analyzer] Not installed. Run: npm install @next/bundle-analyzer"
            );
        }
    }
    return nextConfig;
};

module.exports = { withBundleAnalyzer };
