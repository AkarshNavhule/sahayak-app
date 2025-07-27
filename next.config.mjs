/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
  // Alternative approach - if the above doesn't work
  serverExternalPackages: ['pdf-parse'],
  
  // You may also want to increase body size limit for larger PDFs
  experimental: {
    serverActions: {
      bodySizeLimit: '40mb',
    },
  },
};

export default nextConfig;