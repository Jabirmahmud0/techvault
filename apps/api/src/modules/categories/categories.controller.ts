import type { Request, Response, NextFunction } from "express";
import { categoriesService } from "./categories.service.js";
import { CacheService } from "../../services/cache.service.js";

export const categoriesController = {
    /** GET /api/categories */
    async list(_req: Request, res: Response, next: NextFunction) {
        try {
            const cacheKey = CacheService.generateKey("categories", "list");
            const data = await CacheService.remember(cacheKey, () => categoriesService.list(), { ttl: 3600 }); // 1 hour
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    /** GET /api/categories/:slug */
    async getBySlug(req: Request, res: Response, next: NextFunction) {
        try {
            const slug = req.params.slug as string;
            const cacheKey = CacheService.generateKey("categories", "slug", slug);
            const data = await CacheService.remember(cacheKey, () => categoriesService.getBySlug(slug), { ttl: 3600 });
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    /** POST /api/categories (Admin only) */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await categoriesService.create(req.body);
            await CacheService.invalidatePattern("categories:*");
            res.status(201).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },
};
