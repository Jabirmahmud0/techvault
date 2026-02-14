import { Router } from "express";
import { usersController } from "./users.controller.js";
import { authenticate } from "../../middleware/index.js";

const router = Router();

// Get current user profile
router.get("/profile", authenticate, usersController.getProfile);

// Update current user profile
router.patch("/profile", authenticate, usersController.updateProfile);

export default router;
