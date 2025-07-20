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
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.s3.ap-northeast-1.amazonaws.com',
        port: '',
        pathname: '/avatars/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
        port: '',
        pathname: '/avatars/**',
      },
    ],
  },
};

export default nextConfig; 