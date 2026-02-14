import { Router } from "express";
import express from "express";
import { webhookController } from "./webhook.controller.js";

const router = Router();

// Stripe requires the raw body for signature verification.
// This middleware must run BEFORE any JSON body parsing.
router.post(
    "/",
    express.raw({ type: "application/json" }),
    webhookController.handleStripeEvent
);

export default router;
