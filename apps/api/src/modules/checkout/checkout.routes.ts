import { Router } from "express";
import { checkoutController } from "./checkout.controller.js";
import { authenticate } from "../../middleware/index.js";

const router = Router();

router.post("/", authenticate, checkoutController.createSession);

export default router;
