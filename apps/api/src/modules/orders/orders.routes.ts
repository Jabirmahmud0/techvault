import { Router } from "express";
import { ordersController } from "./orders.controller.js";
import { authenticate, authorize } from "../../middleware/index.js";

const router = Router();

router.get("/", authenticate, ordersController.list);
router.get("/seller", authenticate, authorize("SELLER", "ADMIN"), ordersController.listSeller);
router.get("/stats/seller", authenticate, authorize("SELLER", "ADMIN"), ordersController.getSellerStats);
router.get("/admin/all", authenticate, authorize("ADMIN"), ordersController.listAll);
router.get("/:id", authenticate, ordersController.get);
router.patch("/:id/status", authenticate, authorize("ADMIN", "SELLER"), ordersController.updateStatus);

export default router;
