/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
            {
                protocol: "https",
                hostname: "placehold.co",
            },
        ],
    },
    async rewrites() {
        const apiUrl = process.env.API_URL || "http://localhost:4000/api";
        return [
            {
                source: "/api/:path*",
                destination: `${apiUrl}/:path*`,
            },
        ];
    },
};

export default nextConfig;
