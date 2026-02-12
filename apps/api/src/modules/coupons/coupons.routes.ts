import { Router } from "express";
import { couponsController } from "./coupons.controller.js";
import { authenticate, authorize } from "../../middleware/index.js";

const router = Router();

router.get("/", authenticate, authorize("ADMIN"), couponsController.list);
router.post("/", authenticate, authorize("ADMIN"), couponsController.create);
router.put("/:id", authenticate, authorize("ADMIN"), couponsController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), couponsController.delete);

export default router;
