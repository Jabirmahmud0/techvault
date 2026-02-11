import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "demo", // Fallback for dev/test if not set
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };
