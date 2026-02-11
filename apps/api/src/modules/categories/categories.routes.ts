import { Router } from "express";
import { categoriesController } from "./categories.controller.js";
import { authenticate, authorize, validate } from "../../middleware/index.js";
import { createCategorySchema } from "@repo/types";

const router = Router();

/** GET /api/categories — List all categories */
router.get("/", categoriesController.list);

/** GET /api/categories/:slug — Get category by slug */
router.get("/:slug", categoriesController.getBySlug);

/** POST /api/categories — Create category (Admin only) */
router.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    validate(createCategorySchema),
    categoriesController.create
);

export default router;
