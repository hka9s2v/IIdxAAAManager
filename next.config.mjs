/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // デプロイ時にESLintエラーを無視
    ignoreDuringBuilds: true,
  },
  typescript: {
    // デプロイ時にTypeScriptエラーを無視
    ignoreBuildErrors: true,
  },
};

export default nextConfig; 