/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'websrepublic.co.kr' },
      { protocol: 'https', hostname: '**.co.kr' },
      { protocol: 'https', hostname: '**.kr' },
    ],
  },
};

export default nextConfig;