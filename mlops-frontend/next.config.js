/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async redirects() {
    return [
      {
        source: '/',  // URL gốc
        destination: '/login',  // Trang đích
        permanent: false,  // Chuyển hướng tạm thời (để tránh lưu cache)
      },
    ]
  },
}

module.exports = nextConfig
