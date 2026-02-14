import type { Request, Response, NextFunction } from "express";
import { usersService } from "./users.service.js";
import { updateProfileSchema } from "@repo/types";

export const usersController = {
    /**
     * Get current user profile
     */
    async getProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as any).userId;
            const data = await usersService.getProfile(userId);
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Update current user profile
     */
    async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as any).userId;

            // Validate input
            const body = updateProfileSchema.parse(req.body);

            const data = await usersService.updateProfile(userId, body);
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }
};
