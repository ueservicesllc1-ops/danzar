import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/s3/:path*',
        destination: 'http://localhost:3001/:path*', // Proxy para S3 CORS
      },
      {
        source: '/api/backend/:path*',
        destination: 'http://localhost:5000/:path*', // Proxy para backend
      },
    ];
  },
};

export default nextConfig;
