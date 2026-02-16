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

            // Registration no longer returns tokens, just a success message
            res.status(201).json({
                success: true,
                data: {
                    user: result.user,
                    message: result.message,
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
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: "/api/auth",
            } as any);

            res.cookie("accessToken", result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 15 * 60 * 1000,
                path: "/",
            } as any);

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
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: "/api/auth",
            } as any);

            res.cookie("accessToken", tokens.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 15 * 60 * 1000,
                path: "/",
            } as any);

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
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax" as const,
        };

        res.clearCookie("refreshToken", { ...cookieOptions, path: "/api/auth" } as any);
        res.clearCookie("accessToken", { ...cookieOptions, path: "/" } as any);
        res.status(200).json({ success: true, message: "Logged out" });
    },

    /** POST /api/auth/firebase */
    async firebaseLogin(req: Request, res: Response, next: NextFunction) {
        try {
            const { idToken } = req.body; // Firebase ID Token
            if (!idToken) {
                res.status(400).json({ success: false, error: "Missing Firebase token" });
                return;
            }

            const result = await authService.loginWithFirebase(idToken);

            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: "/api/auth",
            } as any);

            res.cookie("accessToken", result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 15 * 60 * 1000,
                path: "/",
            } as any);

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

    /** POST /api/auth/forgot-password */
    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({ success: false, error: "Email is required" });
                return;
            }
            const result = await authService.forgotPassword(email);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    },

    /** POST /api/auth/reset-password */
    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, token, newPassword } = req.body;
            if (!email || !token || !newPassword) {
                res.status(400).json({ success: false, error: "Email, token, and new password are required" });
                return;
            }
            const result = await authService.resetPassword(email, token, newPassword);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    },

    /** POST /api/auth/verify-email */
    async verifyEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) {
                res.status(400).json({ success: false, error: "Email and OTP are required" });
                return;
            }
            const result = await authService.verifyEmail(email, otp);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    },

    /** POST /api/auth/resend-verification */
    async resendVerification(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({ success: false, error: "Email is required" });
                return;
            }
            const result = await authService.resendVerification(email);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    },

    async fixAdmin(_req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.fixAdminAccount();
            res.status(200).json({
                success: true,
                message: "Admin Fixed",
                credentials: result
            });
        } catch (error) {
            next(error);
        }
    }
};
