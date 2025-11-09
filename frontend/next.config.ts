import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'localhost',
      'res.cloudinary.com',
      'picsum.photos'
    ],
  },
};

export default nextConfig;
