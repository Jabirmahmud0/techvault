import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ApiError } from "./errorHandler.js";

/**
 * Middleware factory: Validates request data against a Zod schema.
 * Supports validating body, query, and params.
 *
 * @example
 * router.post("/", validate(createProductSchema, "body"), controller.create);
 * router.get("/", validate(productQuerySchema, "query"), controller.list);
 */
export function validate(schema: z.ZodSchema, source: "body" | "query" | "params" = "body") {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            const result = schema.safeParse(req[source]);

            if (!result.success) {
                const errors = result.error.errors
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", ");
                throw ApiError.badRequest(`Validation failed: ${errors}`);
            }

            // Replace with parsed/coerced values
            req[source] = result.data;
            next();
        } catch (error) {
            next(error);
        }
    };
}
