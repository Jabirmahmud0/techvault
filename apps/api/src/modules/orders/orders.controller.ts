import type { Request, Response, NextFunction } from "express";
import { ordersService } from "./orders.service.js";

export const ordersController = {
    /**
     * List authenticated user's orders
     */
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as any).userId;
            const data = await ordersService.listUserOrders(userId);
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Get single order details
     */
    async get(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as any)?.userId;
            const userRole = (req.user as any)?.role;
            const { id } = req.params;

            const isAdmin = userRole === "ADMIN";
            const data = await ordersService.getOrder(id as string, userId, isAdmin);

            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },

    /**
     * List all orders (Admin)
     */
    async listAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit, search, status } = req.query;
            const result = await ordersService.listAllOrders({
                page: Number(page) || 1,
                limit: Number(limit) || 10,
                search: search ? String(search) : undefined,
                status: status ? String(status) : undefined,
            });
            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    },

    /**
     * List seller orders
     */
    async listSeller(req: Request, res: Response, next: NextFunction) {
        try {
            const sellerId = (req.user as any).userId;
            const { page, limit, search, status } = req.query;

            const result = await ordersService.listSellerOrders(sellerId, {
                page: Number(page) || 1,
                limit: Number(limit) || 10,
                search: search ? String(search) : undefined,
                status: status ? String(status) : undefined,
            });
            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Get seller stats
     */
    async getSellerStats(req: Request, res: Response, next: NextFunction) {
        try {
            const sellerId = (req.user as any).userId;
            const stats = await ordersService.getSellerStats(sellerId);
            res.json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Update order status (Admin)
     */
    async updateStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const userId = (req.user as any).userId;
            const role = (req.user as any).role;

            const data = await ordersService.updateStatus(id as string, status, userId, role);
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }
};
