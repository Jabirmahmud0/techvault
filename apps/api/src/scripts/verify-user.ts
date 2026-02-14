import { db } from "../config/database.js";
import { users } from "@repo/db/schema";
import { eq } from "drizzle-orm";

const email = process.argv[2];

if (!email) {
    console.error("Please provide an email address as an argument.");
    process.exit(1);
}

async function verifyUser() {
    try {
        console.log(`Searching for user with email: ${email}...`);

        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!existingUser) {
            console.error("User not found!");
            process.exit(1);
        }

        if (existingUser.emailVerified) {
            console.log("User is already verified.");
            process.exit(0);
        }

        console.log("Verifying user...");
        await db.update(users)
            .set({ emailVerified: true })
            .where(eq(users.email, email));

        console.log(`Success! User ${email} is now verified.`);
        process.exit(0);
    } catch (error) {
        console.error("Error verifying user:", error);
        process.exit(1);
    }
}

verifyUser();
