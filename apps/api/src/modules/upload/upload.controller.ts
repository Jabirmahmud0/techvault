import type { Request, Response, NextFunction } from "express";
import { cloudinary } from "../../config/cloudinary.js";
import { ApiError } from "../../middleware/index.js";

export const uploadController = {
    /**
     * Upload a single image to Cloudinary
     */
    async uploadImage(req: Request, res: Response, next: NextFunction) {
        try {
            if (!(req as any).file) {
                throw ApiError.badRequest("No file uploaded");
            }

            const file = (req as any).file;
            // Convert buffer to base64 data URI for Cloudinary upload
            const b64 = Buffer.from(file.buffer).toString("base64");
            const dataURI = "data:" + file.mimetype + ";base64," + b64;

            const folder = (req.query.folder as string) || "products";
            const result = await cloudinary.uploader.upload(dataURI, {
                folder: `techvault/${folder}`,
                resource_type: "auto",
            });

            res.json({
                success: true,
                data: {
                    url: result.secure_url,
                    publicId: result.public_id,
                    format: result.format,
                    width: result.width,
                    height: result.height,
                },
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Delete an image from Cloudinary
     */
    async deleteImage(req: Request, res: Response, next: NextFunction) {
        try {
            const { publicId } = req.body;

            if (!publicId) {
                throw ApiError.badRequest("publicId is required");
            }

            const result = await cloudinary.uploader.destroy(publicId);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    },
};
