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
        // Only proxy /api in development — in production the frontend
        // calls the Railway API URL directly via NEXT_PUBLIC_API_URL
        if (process.env.NODE_ENV === "production") return [];
        return [
            {
                source: "/api/:path*",
                destination: "http://localhost:4000/api/:path*",
            },
        ];
    },
};

export default nextConfig;
