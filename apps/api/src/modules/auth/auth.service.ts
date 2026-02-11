import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { users } from "@repo/db/schema";
import { db } from "../../config/database.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../middleware/index.js";
import type { RegisterInput, LoginInput, JwtPayload } from "@repo/types";

const SALT_ROUNDS = 12;

/**
 * Generates a JWT access token (short-lived) and refresh token (long-lived).
 */
function generateTokens(payload: Omit<JwtPayload, "iat" | "exp">) {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRY,
    });
    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRY,
    });
    return { accessToken, refreshToken };
}

/**
 * Strips sensitive fields from user object before sending to client.
 */
function sanitizeUser(user: typeof users.$inferSelect) {
    const { passwordHash, ...safe } = user;
    return safe;
}

export const authService = {
    /**
     * Register a new user account.
     * @throws ApiError 409 if email is already in use.
     */
    async register(input: RegisterInput) {
        // Check for existing user
        const existing = await db.query.users.findFirst({
            where: eq(users.email, input.email),
        });

        if (existing) {
            throw ApiError.conflict("Email is already registered");
        }

        // Hash password and create user
        const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

        const [user] = await db
            .insert(users)
            .values({
                name: input.name,
                email: input.email,
                passwordHash,
            })
            .returning();

        const tokens = generateTokens({
            userId: user!.id,
            email: user!.email,
            role: user!.role,
        });

        return {
            user: sanitizeUser(user!),
            ...tokens,
        };
    },

    /**
     * Login with email and password.
     * @throws ApiError 401 if credentials are invalid.
     */
    async login(input: LoginInput) {
        const user = await db.query.users.findFirst({
            where: eq(users.email, input.email),
        });

        if (!user || !user.passwordHash) {
            throw ApiError.unauthorized("Invalid email or password");
        }

        const isValid = await bcrypt.compare(input.password, user.passwordHash);
        if (!isValid) {
            throw ApiError.unauthorized("Invalid email or password");
        }

        const tokens = generateTokens({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            user: sanitizeUser(user),
            ...tokens,
        };
    },

    /**
     * Refresh the access token using a valid refresh token.
     * @throws ApiError 401 if the refresh token is invalid.
     */
    async refresh(refreshToken: string) {
        try {
            const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtPayload;

            // Verify user still exists
            const user = await db.query.users.findFirst({
                where: eq(users.id, decoded.userId),
            });

            if (!user) {
                throw ApiError.unauthorized("User no longer exists");
            }

            const tokens = generateTokens({
                userId: user.id,
                email: user.email,
                role: user.role,
            });

            return tokens;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw ApiError.unauthorized("Invalid refresh token");
        }
    },

    /**
     * Get the current authenticated user's profile.
     */
    async getMe(userId: string) {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) {
            throw ApiError.notFound("User not found");
        }

        return sanitizeUser(user);
    },
};
