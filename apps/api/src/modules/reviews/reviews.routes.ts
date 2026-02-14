import { Router } from "express";
import { reviewsController } from "./reviews.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createReviewSchema } from "@repo/types";

const router = Router();

// Public: List reviews for a product
router.get("/:productId", reviewsController.listByProduct);

// Public: Rating breakdown for a product
router.get("/:productId/breakdown", reviewsController.getRatingBreakdown);

// Protected: Create a review (must be logged in)
router.post("/", authenticate, validate(createReviewSchema, "body"), reviewsController.create);

// Protected: Delete own review
router.delete("/:id", authenticate, reviewsController.delete);

export default router;
