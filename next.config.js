/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    INFURA_IPFS_DEDICATED_GATEWAY: process.env.INFURA_IPFS_DEDICATED_GATEWAY,
    INFURA_IPFS_PROJECT_ID: process.env.INFURA_IPFS_PROJECT_ID,
    INFURA_IPFS_PROJECT_SECRET: process.env.INFURA_IPFS_PROJECT_SECRET,
    INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID,
    PRIVATE_KEY: process.env.PRIVATE_KEY
  },
}

module.exports = nextConfig
