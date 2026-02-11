import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "./errorHandler.js";
import type { JwtPayload, UserRole } from "@repo/types";

/** Extends Express Request with authenticated user data */
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

/**
 * Middleware: Verify JWT access token from Authorization header.
 * Attaches decoded user payload to `req.user`.
 */
export function authenticate(
    req: Request,
    _res: Response,
    next: NextFunction
): void {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            throw ApiError.unauthorized("No token provided");
        }

        const token = authHeader.split(" ")[1]!;
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof ApiError) {
            next(error);
            return;
        }
        next(ApiError.unauthorized("Invalid or expired token"));
    }
}

/**
 * Middleware factory: Restrict access to specific user roles.
 * Must be used after `authenticate`.
 *
 * @example
 * router.post("/", authenticate, authorize("ADMIN"), controller.create);
 */
export function authorize(...roles: UserRole[]) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            next(ApiError.unauthorized());
            return;
        }

        if (!roles.includes(req.user.role)) {
            next(ApiError.forbidden("You do not have permission to access this resource"));
            return;
        }

        next();
    };
}
