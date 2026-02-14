import Stripe from "stripe";
import { env } from "./env.js";

/**
 * Stripe client instance — initialized with the secret key.
 * Uses the latest API version for type safety.
 */
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    typescript: true,
});
