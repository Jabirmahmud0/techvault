import { Request, Response, NextFunction } from "express";

/**
 * Input sanitization middleware for XSS prevention.
 * Recursively strips HTML/script tags and dangerous patterns from request body,
 * query params, and URL params.
 */
export function sanitize(req: Request, _res: Response, next: NextFunction) {
    if (req.body && typeof req.body === "object") {
        sanitizeInPlace(req.body);
    }
    if (req.query && typeof req.query === "object") {
        sanitizeInPlace(req.query);
    }
    if (req.params && typeof req.params === "object") {
        sanitizeInPlace(req.params);
    }
    next();
}

/**
 * Mutates an object in-place to sanitize its values.
 * This avoids reassigning read-only properties like req.query/req.params.
 */
function sanitizeInPlace(obj: Record<string, any>) {
    for (const key of Object.keys(obj)) {
        const value = obj[key];
        if (typeof value === "string") {
            obj[key] = sanitizeString(value);
        } else if (Array.isArray(value)) {
            // Arrays are replaced with a sanitized copy
            obj[key] = value.map((item) =>
                typeof item === "string"
                    ? sanitizeString(item)
                    : typeof item === "object" && item !== null
                        ? sanitizeObjectCopy(item)
                        : item
            );
        } else if (typeof value === "object" && value !== null) {
            sanitizeInPlace(value);
        }
    }
}

/**
 * Creates a sanitized copy of an object (for use within arrays).
 */
function sanitizeObjectCopy(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string") {
            sanitized[key] = sanitizeString(value);
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map((item) =>
                typeof item === "string"
                    ? sanitizeString(item)
                    : typeof item === "object" && item !== null
                        ? sanitizeObjectCopy(item)
                        : item
            );
        } else if (typeof value === "object" && value !== null) {
            sanitized[key] = sanitizeObjectCopy(value);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}

function sanitizeString(input: string): string {
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Strip script tags
        .replace(/<\/?[^>]+(>|$)/g, "") // Strip all HTML tags
        .replace(/javascript:/gi, "") // Strip JS protocol
        .replace(/on\w+\s*=/gi, "") // Strip inline event handlers (onclick, onerror, etc.)
        .replace(/data:\s*text\/html/gi, "") // Strip data:text/html
        .trim();
}
