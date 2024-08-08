/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    REACT_APP_BASE_URL: process.env.REACT_APP_BASE_URL,
    REACT_APP_WB_SOCKET: process.env.REACT_APP_WB_SOCKET,
  },
};

export default nextConfig;
