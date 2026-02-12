import { Router } from "express";
import { settingsController } from "./settings.controller.js";
import { authenticate, authorize } from "../../middleware/index.js";

export const settingsRouter = Router();

// Get settings - accessible to authenticated users (or maybe public? keeping auth for now)
settingsRouter.get("/", authenticate, settingsController.get);

import { UserRole } from "@repo/types";

// Update settings - Admin only
settingsRouter.patch("/", authenticate, authorize("ADMIN"), settingsController.update);
