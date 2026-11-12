/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/testimonials',
        destination: '/',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    const serverUrl = process.env.SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    return [
      {
        source: '/api/:path*',
        destination: `${serverUrl}/api/:path*`,
      },
      {
        source: '/plots/:path*',
        destination: `${serverUrl}/plots/:path*`,
      },
      {
        source: '/documents/:path*',
        destination: `${serverUrl}/documents/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${serverUrl}/uploads/:path*`,
      },
      {
        source: '/images/plots/:path*',
        destination: `${serverUrl}/images/plots/:path*`,
      },
    ]
  },
}

export default nextConfig
