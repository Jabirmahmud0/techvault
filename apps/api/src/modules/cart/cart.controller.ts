import type { Request, Response, NextFunction } from "express";
import { cartService } from "./cart.service.js";

export const cartController = {
    /** GET /api/cart */
    async getCart(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await cartService.getCart(req.user!.userId);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    /** POST /api/cart */
    async addItem(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await cartService.addItem(req.user!.userId, req.body);
            res.status(201).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    /** PUT /api/cart/:id */
    async updateItem(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await cartService.updateItem(
                req.user!.userId,
                req.params.id as string,
                req.body
            );
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    /** DELETE /api/cart/:id */
    async removeItem(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await cartService.removeItem(req.user!.userId, req.params.id as string);
            res.status(200).json({ success: true, ...data });
        } catch (error) {
            next(error);
        }
    },

    /** DELETE /api/cart */
    async clearCart(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await cartService.clearCart(req.user!.userId);
            res.status(200).json({ success: true, ...data });
        } catch (error) {
            next(error);
        }
    },

    /** GET /api/cart/count */
    async getCount(req: Request, res: Response, next: NextFunction) {
        try {
            const count = await cartService.getCount(req.user!.userId);
            res.status(200).json({ success: true, data: { count } });
        } catch (error) {
            next(error);
        }
    },
};
