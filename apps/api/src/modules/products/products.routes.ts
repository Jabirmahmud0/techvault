import { Router } from "express";
import { productsController } from "./products.controller.js";
import { authenticate, authorize, validate } from "../../middleware/index.js";
import { productQuerySchema, createProductSchema, updateProductSchema } from "@repo/types";

const router = Router();

/** GET /api/products — List products with filters + pagination */
router.get("/", validate(productQuerySchema, "query"), productsController.list);

/** GET /api/products/featured — Get featured products */
router.get("/featured", productsController.featured);

/** GET /api/products/brands — Get all unique brands */
router.get("/brands", productsController.brands);

/** GET /api/products/:slug — Get single product by slug */
router.get("/:slug", productsController.getBySlug);

/** POST /api/products — Create product (Admin/Seller only) */
router.post(
    "/",
    authenticate,
    authorize("ADMIN", "SELLER"),
    validate(createProductSchema),
    productsController.create
);

/** PUT /api/products/:id — Update product (Admin/Seller only) */
router.put(
    "/:id",
    authenticate,
    authorize("ADMIN", "SELLER"),
    validate(updateProductSchema),
    productsController.update
);

export default router;
