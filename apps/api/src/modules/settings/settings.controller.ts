import type { Request, Response, NextFunction } from "express";
import { settingsService } from "./settings.service.js";
import { updateSettingsSchema } from "@repo/types";
import { ApiError } from "../../middleware/index.js";

export const settingsController = {
    /**
     * Get current settings
     */
    async get(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await settingsService.getSettings();
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Update settings (Admin only)
     */
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            // Validate body
            const body = updateSettingsSchema.parse(req.body);

            const data = await settingsService.updateSettings(body);
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }
};
