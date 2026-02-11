import { Router } from "express";
import { cartController } from "./cart.controller.js";
import { authenticate, validate } from "../../middleware/index.js";
import { addToCartSchema, updateCartItemSchema } from "@repo/types";

const router = Router();

// All cart routes require authentication
router.use(authenticate);

/** GET /api/cart — Get user's cart items */
router.get("/", cartController.getCart);

/** GET /api/cart/count — Get cart item count for badge */
router.get("/count", cartController.getCount);

/** POST /api/cart — Add item to cart */
router.post("/", validate(addToCartSchema), cartController.addItem);

/** PUT /api/cart/:id — Update cart item quantity */
router.put("/:id", validate(updateCartItemSchema), cartController.updateItem);

/** DELETE /api/cart/:id — Remove item from cart */
router.delete("/:id", cartController.removeItem);

/** DELETE /api/cart — Clear entire cart */
router.delete("/", cartController.clearCart);

export default router;
