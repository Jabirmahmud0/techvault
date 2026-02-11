import type { Request, Response, NextFunction } from "express";
import { productsService } from "./products.service.js";

/**
 * Products controller — handles HTTP layer for product operations.
 */
export const productsController = {
    /** GET /api/products */
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await productsService.list(req.query as any);
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    },

    /** GET /api/products/featured */
    async featured(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await productsService.getFeatured();
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    /** GET /api/products/brands */
    async brands(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await productsService.getBrands();
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    /** GET /api/products/:slug */
    async getBySlug(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await productsService.getBySlug(req.params.slug!);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    /** POST /api/products (Admin/Seller only) */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await productsService.create(req.body, req.user!.userId);
            res.status(201).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    /** PUT /api/products/:id (Admin/Seller only) */
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await productsService.update(req.params.id!, req.body);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },
};
