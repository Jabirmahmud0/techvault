import { Router } from "express";
import { uploadController } from "./upload.controller.js";
import { upload } from "../../middleware/upload.js";
import { authenticate, authorize } from "../../middleware/index.js";

const router = Router();

// Only sellers and admins can upload images
router.post(
    "/",
    authenticate,
    authorize("SELLER", "ADMIN"),
    upload.single("image"),
    uploadController.uploadImage
);

export default router;
