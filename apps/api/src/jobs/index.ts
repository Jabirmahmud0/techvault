/**
 * Background jobs module.
 *
 * This folder contains scheduled and queued background tasks:
 *
 * - Email queue processing (order confirmations, shipping notifications)
 * - Stock alert monitoring (low-stock notifications for sellers)
 * - Cache warming (pre-populate Redis caches for hot product pages)
 * - Abandoned cart reminders
 * - Analytics aggregation
 *
 * Jobs are designed to run outside the request/response cycle,
 * either via a cron scheduler (node-cron) or a message queue (BullMQ).
 *
 * Usage:
 *   import { startJobs } from "./jobs/index.js";
 *   startJobs();  // Called from app startup
 */

// Placeholder — wire up actual job runners here
export function startJobs() {
    console.log("[jobs] Background job runner initialized");
    // TODO: Add cron jobs or BullMQ workers
}
