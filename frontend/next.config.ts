import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'localhost',
      'res.cloudinary.com',
      'picsum.photos',
      'randomuser.me'
    ],
  },
};

export default nextConfig;
