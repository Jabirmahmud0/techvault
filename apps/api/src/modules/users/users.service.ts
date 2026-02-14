import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { users } from "@repo/db/schema";
import { db } from "../../config/database.js";
import { ApiError } from "../../middleware/index.js";
import { UpdateProfileInput } from "@repo/types";

export const usersService = {
    /**
     * Get user profile
     */
    async getProfile(userId: string) {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                createdAt: true,
            }
        });

        if (!user) {
            throw ApiError.notFound("User not found");
        }

        return user;
    },

    /**
     * Update user profile
     */
    async updateProfile(userId: string, input: UpdateProfileInput) {
        console.log(`[PROFILE DEBUG] Updating profile for ${userId}:`, input);

        const updates: Partial<typeof users.$inferInsert> = {
            name: input.name,
            image: input.image,
            updatedAt: new Date(),
        };

        if (input.password) {
            updates.passwordHash = await bcrypt.hash(input.password, 12);
        }

        const [updatedUser] = await db
            .update(users)
            .set(updates)
            .where(eq(users.id, userId))
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                image: users.image,
                role: users.role,
            });

        return updatedUser;
    }
};
