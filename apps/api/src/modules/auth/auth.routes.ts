import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authenticate, validate } from "../../middleware/index.js";
import { registerSchema, loginSchema } from "@repo/types";

const router = Router();

/** POST /api/auth/register — Create a new account */
router.post("/register", validate(registerSchema), authController.register);

/** POST /api/auth/login — Login with email/password */
router.post("/login", validate(loginSchema), authController.login);

/** POST /api/auth/google — Login with Google */
router.post("/google", authController.googleLogin);

/** POST /api/auth/refresh — Refresh access token */
router.post("/refresh", authController.refresh);

/** GET /api/auth/me — Get current user profile (protected) */
router.get("/me", authenticate, authController.getMe);

/** POST /api/auth/logout — Clear refresh token cookie */
router.post("/logout", authController.logout);

/** POST /api/auth/forgot-password — Request password reset email */
router.post("/forgot-password", authController.forgotPassword);

/** POST /api/auth/reset-password — Reset password with token */
router.post("/reset-password", authController.resetPassword);

/** POST /api/auth/verify-email — Verify email with token */
router.post("/verify-email", authController.verifyEmail);

/** POST /api/auth/resend-verification — Resend verification email (public) */
router.post("/resend-verification", authController.resendVerification);

export default router;
