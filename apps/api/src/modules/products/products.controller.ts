import type { Request, Response, NextFunction } from "express";
import { productsService } from "./products.service.js";
import { CacheService } from "../../services/cache.service.js";

/**
 * Products controller — handles HTTP layer for product operations.
 */
export const productsController = {
    /** GET /api/products */
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const cacheKey = CacheService.generateKey("products", "list", JSON.stringify(req.query));
            const result = await CacheService.remember(cacheKey, () => productsService.list(req.query as any));
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    },

    /** GET /api/products/featured */
    async featured(req: Request, res: Response, next: NextFunction) {
        try {
            const cacheKey = CacheService.generateKey("products", "featured");
            const data = await CacheService.remember(cacheKey, () => productsService.getFeatured());
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    /** GET /api/products/brands */
    async brands(req: Request, res: Response, next: NextFunction) {
        try {
            const cacheKey = CacheService.generateKey("products", "brands");
            const data = await CacheService.remember(cacheKey, () => productsService.getBrands());
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    /** GET /api/products/:slug */
    async getBySlug(req: Request, res: Response, next: NextFunction) {
        try {
            const slug = req.params.slug as string;
            const cacheKey = CacheService.generateKey("products", "slug", slug);
            const data = await CacheService.remember(cacheKey, () => productsService.getBySlug(slug));
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    /** POST /api/products (Admin/Seller only) */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await productsService.create(req.body, req.user!.userId);
            await CacheService.invalidatePattern("products:*");
            res.status(201).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    /** PUT /api/products/:id (Admin/Seller only) */
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const data = await productsService.update(id, req.body);
            await CacheService.invalidatePattern("products:*");
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    /** GET /api/products/by-id/:id */
    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const data = await productsService.getById(id);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    /** DELETE /api/products/:id (Admin/Seller only) */
    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            await productsService.delete(id);
            await CacheService.invalidatePattern("products:*");
            res.status(200).json({ success: true, message: "Product deleted successfully" });
        } catch (error) {
            next(error);
        }
    },
};
