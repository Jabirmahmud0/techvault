import { Router } from "express";
import { ordersController } from "./orders.controller.js";
import { authenticate } from "../../middleware/index.js";

const router = Router();

router.get("/", authenticate, ordersController.list);
router.get("/:id", authenticate, ordersController.get);

export default router;
