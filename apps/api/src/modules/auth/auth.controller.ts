import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service.js";
import { emailService } from "../email/email.service.js";

/**
 * Auth controller — thin layer that parses requests and delegates to the service.
 */
export const authController = {
    /** POST /api/auth/register */
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.register(req.body);

            // Set refresh token as httpOnly cookie
            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                path: "/api/auth",
            });

            res.status(201).json({
                success: true,
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                },
            });

            // Send welcome email (async, don't await/block response)
            emailService.sendWelcomeEmail(req.body.email, req.body.name).catch(console.error);
        } catch (error) {
            next(error);
        }
    },

    /** POST /api/auth/login */
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.login(req.body);

            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: "/api/auth",
            });

            res.status(200).json({
                success: true,
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                },
            });
        } catch (error) {
            next(error);
        }
    },

    /** POST /api/auth/refresh */
    async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) {
                res.status(401).json({ success: false, error: "No refresh token" });
                return;
            }

            const tokens = await authService.refresh(refreshToken);

            res.cookie("refreshToken", tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: "/api/auth",
            });

            res.status(200).json({
                success: true,
                data: { accessToken: tokens.accessToken },
            });
        } catch (error) {
            next(error);
        }
    },

    /** GET /api/auth/me */
    async getMe(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await authService.getMe(req.user!.userId);
            res.status(200).json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    },

    async logout(_req: Request, res: Response) {
        res.clearCookie("refreshToken", { path: "/api/auth" });
        res.status(200).json({ success: true, message: "Logged out" });
    },

    /** POST /api/auth/google */
    async googleLogin(req: Request, res: Response, next: NextFunction) {
        try {
            const { credential } = req.body; // Google ID Token
            if (!credential) {
                res.status(400).json({ success: false, error: "Missing Google token" });
                return;
            }

            const result = await authService.loginWithGoogle(credential);

            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: "/api/auth",
            });

            res.status(200).json({
                success: true,
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                },
            });

            // Send welcome email if it's a new user?
            // Checking if newly created is hard here without refactor, skipping for now to avoid complexity.
            // Or we could check if user.createdAt is very recent.
        } catch (error) {
            next(error);
        }
    },
};
