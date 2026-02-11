import type { Request, Response, NextFunction } from "express";
import { categoriesService } from "./categories.service.js";

export const categoriesController = {
    /** GET /api/categories */
    async list(_req: Request, res: Response, next: NextFunction) {
        try {
            const data = await categoriesService.list();
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    /** GET /api/categories/:slug */
    async getBySlug(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await categoriesService.getBySlug(req.params.slug!);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    /** POST /api/categories (Admin only) */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await categoriesService.create(req.body);
            res.status(201).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },
};
