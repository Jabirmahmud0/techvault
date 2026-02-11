import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authenticate, validate } from "../../middleware/index.js";
import { registerSchema, loginSchema } from "@repo/types";

const router = Router();

/** POST /api/auth/register — Create a new account */
router.post("/register", validate(registerSchema), authController.register);

/** POST /api/auth/login — Login with email/password */
router.post("/login", validate(loginSchema), authController.login);

/** POST /api/auth/refresh — Refresh access token */
router.post("/refresh", authController.refresh);

/** GET /api/auth/me — Get current user profile (protected) */
router.get("/me", authenticate, authController.getMe);

/** POST /api/auth/logout — Clear refresh token cookie */
router.post("/logout", authController.logout);

export default router;
