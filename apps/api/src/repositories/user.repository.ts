import { db } from "../config/database.js";
import { eq, sql } from "drizzle-orm";
import * as schema from "@repo/db/schema";

/**
 * User repository — data access layer for users table.
 */
export const userRepository = {
    async findById(id: string) {
        const [user] = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, id))
            .limit(1);
        return user ?? null;
    },

    async findByEmail(email: string) {
        const [user] = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, email))
            .limit(1);
        return user ?? null;
    },

    async create(data: typeof schema.users.$inferInsert) {
        const [user] = await db.insert(schema.users).values(data).returning();
        return user;
    },

    async update(id: string, data: Partial<typeof schema.users.$inferInsert>) {
        const [user] = await db
            .update(schema.users)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(schema.users.id, id))
            .returning();
        return user ?? null;
    },

    async count() {
        const [result] = await db
            .select({ count: sql<number>`count(*)` })
            .from(schema.users);
        return Number(result?.count ?? 0);
    },
};
