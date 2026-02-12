import { Router } from "express";
import { adminController } from "./admin.controller.js";
import { authenticate, authorize } from "../../middleware/index.js";

const router = Router();

// Stats
router.get("/stats", authenticate, authorize("ADMIN"), adminController.getStats);
router.get("/recent-orders", authenticate, authorize("ADMIN"), adminController.getRecentOrders);
router.get("/revenue-chart", authenticate, authorize("ADMIN"), adminController.getRevenueChart);
router.get("/revenue-by-category", authenticate, authorize("ADMIN"), adminController.getRevenueByCategory);
router.get("/low-stock", authenticate, authorize("ADMIN"), adminController.getLowStock);
router.get("/customers", authenticate, authorize("ADMIN"), adminController.getCustomers);

export default router;
