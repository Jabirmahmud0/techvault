import { Router } from "express";
import { ordersController } from "./orders.controller.js";
import { authenticate, authorize } from "../../middleware/index.js";

const router = Router();

router.get("/", authenticate, ordersController.list);
router.get("/admin/all", authenticate, authorize("ADMIN"), ordersController.listAll);
router.get("/:id", authenticate, ordersController.get);
router.patch("/:id/status", authenticate, authorize("ADMIN"), ordersController.updateStatus);

export default router;
