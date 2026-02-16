import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { users } from "@repo/db/schema";
import { db } from "../../config/database.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../middleware/index.js";
import { emailService } from "../email/email.service.js";
import type { RegisterInput, LoginInput, JwtPayload } from "@repo/types";

const SALT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 15;

/**
 * Generate a random 6-digit OTP code.
 */
function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generates a JWT access token (short-lived) and refresh token (long-lived).
 */
function generateTokens(payload: Omit<JwtPayload, "iat" | "exp">) {
    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRY as any,
    });
    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRY as any,
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

        if (existing && existing.emailVerified) {
            throw ApiError.conflict("Email is already registered");
        }

        const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
        const otp = generateOtp();
        const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        let user;

        if (existing && !existing.emailVerified) {
            // Re-registration: update unverified account with new details & fresh OTP
            [user] = await db
                .update(users)
                .set({ name: input.name, passwordHash, otpCode: otp, otpExpiresAt, updatedAt: new Date() })
                .where(eq(users.id, existing.id))
                .returning();
        } else {
            // New registration
            [user] = await db
                .insert(users)
                .values({
                    name: input.name,
                    email: input.email,
                    passwordHash,
                    otpCode: otp,
                    otpExpiresAt,
                })
                .returning();
        }

        // Send OTP email (async, don't block response)
        emailService.sendVerificationEmail(input.email, input.name, otp).catch(console.error);

        return {
            user: sanitizeUser(user!),
            message: "Registration successful. Please check your email to verify your account.",
        };
    },

    /**
     * Login with email and password.
     * @throws ApiError 401 if credentials are invalid.
     */
    async login(input: LoginInput) {
        console.log(`[LOGIN DEBUG] Attempting login for: ${input.email}`);
        let user = await db.query.users.findFirst({
            where: eq(users.email, input.email),
        });

        // --- AUTO-SEEDING FALLBACK FOR DEVELOPMENT ---
        if (!user && input.email === "seller@techvault.com" && env.NODE_ENV === "development") {
            console.log("[LOGIN DEBUG] Seller not found. Auto-seeding...");
            const passwordHash = await bcrypt.hash("Seller123!", SALT_ROUNDS);
            [user] = await db.insert(users).values({
                name: "Seller",
                email: "seller@techvault.com",
                passwordHash,
                role: "SELLER",
                emailVerified: true,
            }).returning();
            if (user) console.log("[LOGIN DEBUG] Seller seeded: ", user.id);
        }
        // ---------------------------------------------

        if (!user) {
            console.log("[LOGIN DEBUG] User not found in DB");
            throw ApiError.unauthorized("Invalid email or password");
        }

        if (!user.passwordHash) {
            console.log("[LOGIN DEBUG] User has no password hash");
            throw ApiError.unauthorized("Invalid email or password");
        }

        console.log(`[LOGIN DEBUG] User found: ${user.id}, Role: ${user.role}`);
        console.log(`[LOGIN DEBUG] Stored Hash: ${user.passwordHash.substring(0, 10)}...`);

        const isValid = await bcrypt.compare(input.password, user.passwordHash);
        console.log(`[LOGIN DEBUG] Password match result: ${isValid}`);
        console.log(`[LOGIN DEBUG] Input Password Length: ${input.password.length} characters`);

        if (!isValid) {
            console.log("[LOGIN DEBUG] Password mismatch");
            throw ApiError.unauthorized("Invalid email or password");
        }

        if (!user.emailVerified) {
            throw ApiError.forbidden("Please verify your email address before logging in.");
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

    /**
     * Login or Register with Firebase ID Token.
     */
    async loginWithFirebase(idToken: string) {
        console.log("[Firebase Login] Starting loginWithFirebase...");
        const { firebaseAdmin, isFirebaseInitialized, missingKeys } = await import("../../config/firebase.js");

        if (!isFirebaseInitialized) {
            console.error(`[Firebase Login] Firebase not initialized. Missing: ${missingKeys?.join(", ")}`);
            throw ApiError.internal(`Firebase configuration error. Missing vars: ${missingKeys?.join(", ")}`);
        }

        let decodedToken;
        try {
            console.log("[Firebase Login] Verifying ID token...");
            decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
            console.log("[Firebase Login] Token verified for UID:", decodedToken.uid);
        } catch (error: any) {
            console.error("[Firebase Login] Token verification failed:", error);
            console.error("[Firebase Login] Error Code:", error.code);
            console.error("[Firebase Login] Error Message:", error.message);
            if (error.errorInfo) {
                console.error("[Firebase Login] Error Info:", JSON.stringify(error.errorInfo, null, 2));
            }
            throw ApiError.unauthorized(`Invalid Firebase token: ${error.message}`);
        }

        const { email, uid, name, picture } = decodedToken;

        if (!email) {
            console.error("[Firebase Login] Email missing in token");
            throw ApiError.unauthorized("Invalid Firebase token payload: Email missing");
        }

        // Check if user exists
        console.log(`[Firebase Login] Checking for existing user with email: ${email}`);
        let user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user) {
            console.log("[Firebase Login] Creating new user...");
            // Create new user (random password since they use Firebase/Google)
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const passwordHash = await bcrypt.hash(randomPassword, SALT_ROUNDS);

            try {
                [user] = await db
                    .insert(users)
                    .values({
                        name: name || "Firebase User",
                        email,
                        passwordHash,
                        authProvider: "FIREBASE",
                        googleId: uid,
                        image: picture,
                        emailVerified: true,
                        role: "USER"
                    })
                    .returning();
                console.log("[Firebase Login] User created:", user?.id);
            } catch (dbError) {
                console.error("[Firebase Login] Database insert failed:", dbError);
                throw dbError;
            }
        } else if (!user.googleId && user.authProvider !== "FIREBASE") {
            console.log("[Firebase Login] Linking existing user...");
            try {
                // Link Firebase/Google ID to existing user
                [user] = await db
                    .update(users)
                    .set({
                        googleId: uid,
                        authProvider: "FIREBASE",
                        image: picture || user.image,
                        emailVerified: true
                    })
                    .where(eq(users.id, user.id))
                    .returning();
                console.log("[Firebase Login] User linked:", user?.id);
            } catch (dbError) {
                console.error("[Firebase Login] Database update failed:", dbError);
                throw dbError;
            }
        }

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
     * Forgot Password — sends a password reset email with a token link.
     * Uses JWT signed with (JWT_SECRET + passwordHash) so the token
     * auto-invalidates when the password is changed (one-time use).
     */
    async forgotPassword(email: string) {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        // Always return success to prevent email enumeration
        if (!user || !user.passwordHash) {
            return { message: "If an account with that email exists, we've sent a reset link." };
        }

        // Create a reset token — signed with user's password hash
        // so it auto-invalidates when password changes
        const resetToken = jwt.sign(
            { userId: user.id, email: user.email, purpose: "password-reset" },
            env.JWT_SECRET + user.passwordHash,
            { expiresIn: "1h" }
        );

        const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

        await emailService.sendPasswordResetEmail(user.email, user.name, resetUrl);

        return { message: "If an account with that email exists, we've sent a reset link." };
    },

    /**
     * Reset Password — verifies the token and updates the password.
     */
    async resetPassword(email: string, token: string, newPassword: string) {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user || !user.passwordHash) {
            throw ApiError.badRequest("Invalid or expired reset link");
        }

        // Verify the token was signed with the user's current password hash
        try {
            const decoded = jwt.verify(token, env.JWT_SECRET + user.passwordHash) as any;
            if (decoded.purpose !== "password-reset" || decoded.userId !== user.id) {
                throw new Error("Invalid token");
            }
        } catch {
            throw ApiError.badRequest("Invalid or expired reset link");
        }

        // Hash the new password and update
        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await db
            .update(users)
            .set({ passwordHash, updatedAt: new Date() })
            .where(eq(users.id, user.id));

        return { message: "Password reset successfully. You can now log in with your new password." };
    },

    /**
     * Verify email address using a 6-digit OTP code.
     */
    async verifyEmail(email: string, otp: string) {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user) {
            throw ApiError.badRequest("Invalid email or OTP code");
        }

        if (user.emailVerified) {
            return { message: "Email is already verified." };
        }

        // Check OTP matches and hasn't expired
        if (!user.otpCode || user.otpCode !== otp) {
            throw ApiError.badRequest("Invalid OTP code");
        }

        if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
            throw ApiError.badRequest("OTP code has expired. Please request a new one.");
        }

        // Mark email as verified and clear OTP
        await db
            .update(users)
            .set({ emailVerified: true, otpCode: null, otpExpiresAt: null, updatedAt: new Date() })
            .where(eq(users.id, user.id));

        return { message: "Email verified successfully!" };
    },

    /**
     * Resend OTP verification code for the given email.
     */
    async resendVerification(email: string) {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user) {
            return { message: "If an account exists, a verification email has been sent." };
        }

        if (user.emailVerified) {
            return { message: "Email is already verified." };
        }

        // Generate fresh OTP and store it
        const otp = generateOtp();
        const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        await db
            .update(users)
            .set({ otpCode: otp, otpExpiresAt })
            .where(eq(users.id, user.id));

        await emailService.sendVerificationEmail(user.email, user.name, otp);

        return { message: "Verification email sent." };
    },

    /**
     * EMERGENCY FIX: Reset admin account to known good state.
     */
    async fixAdminAccount() {
        const email = "admin@techvault.com";
        const password = "SecretAdmin123!";
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        let user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (user) {
            [user] = await db
                .update(users)
                .set({
                    passwordHash,
                    emailVerified: true,
                    role: "ADMIN",
                    authProvider: "EMAIL"
                })
                .where(eq(users.id, user.id))
                .returning();
        } else {
            [user] = await db
                .insert(users)
                .values({
                    name: "Admin User",
                    email,
                    passwordHash,
                    emailVerified: true,
                    role: "ADMIN",
                    authProvider: "EMAIL"
                })
                .returning();
        }

        return { email, password };
    }
};
