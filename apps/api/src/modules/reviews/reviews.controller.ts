import type { Request, Response, NextFunction } from "express";
import { reviewsService } from "./reviews.service.js";
import type { CreateReviewInput } from "@repo/types";

export const reviewsController = {
    /** GET /reviews/:productId */
    async listByProduct(req: Request, res: Response, next: NextFunction) {
        try {
            const productId = req.params.productId as string;
            const page = parseInt(req.query.page as string || "1");
            const limit = parseInt(req.query.limit as string || "10");

            const result = await reviewsService.listByProduct(productId, page, limit);
            res.json({ success: true, data: result });
        } catch (err) {
            next(err);
        }
    },

    /** GET /reviews/:productId/breakdown */
    async getRatingBreakdown(req: Request, res: Response, next: NextFunction) {
        try {
            const productId = req.params.productId as string;
            const breakdown = await reviewsService.getRatingBreakdown(productId);
            res.json({ success: true, data: breakdown });
        } catch (err) {
            next(err);
        }
    },

    /** POST /reviews */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.userId;
            const input: CreateReviewInput = req.body;
            const review = await reviewsService.create(input, userId);
            res.status(201).json({ success: true, data: review });
        } catch (err) {
            next(err);
        }
    },

    /** DELETE /reviews/:id */
    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.userId;
            const reviewId = req.params.id as string;
            const result = await reviewsService.delete(reviewId, userId);
            res.json({ success: true, data: result });
        } catch (err) {
            next(err);
        }
    },
};
