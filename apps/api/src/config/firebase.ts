import admin from "firebase-admin";
import { env } from "./env.js";

let isFirebaseInitialized = false;
let missingKeys: string[] = [];

if (!admin.apps.length) {
    try {
        if (!env.FIREBASE_PROJECT_ID) missingKeys.push("FIREBASE_PROJECT_ID");
        if (!env.FIREBASE_CLIENT_EMAIL) missingKeys.push("FIREBASE_CLIENT_EMAIL");
        if (!env.FIREBASE_PRIVATE_KEY) missingKeys.push("FIREBASE_PRIVATE_KEY");

        if (missingKeys.length > 0) {
            console.warn(`⚠️ Firebase Admin credentials missing: ${missingKeys.join(", ")}. Firebase auth will fail.`);
        } else {
            // Handle both escaped and unescaped newlines in private key
            let privateKey = env.FIREBASE_PRIVATE_KEY!;
            if (!privateKey.includes('\n') && privateKey.includes('\\n')) {
                privateKey = privateKey.replace(/\\n/g, '\n');
            } else if (!privateKey.includes('\n') && privateKey.includes('-----BEGIN')) {
                // If it's a single line, format it properly with line breaks
                privateKey = privateKey
                    .replace(/-----BEGIN PRIVATE KEY-----/, '-----BEGIN PRIVATE KEY-----\n')
                    .replace(/-----END PRIVATE KEY-----/, '\n-----END PRIVATE KEY-----')
                    .replace(/(.{65}(?!\n))/g, '$1\n'); // Insert newlines every 65 characters within the key data
            }

            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: env.FIREBASE_PROJECT_ID,
                    clientEmail: env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey,
                }),
            });
            isFirebaseInitialized = true;
            console.log("✅ Firebase Admin initialized successfully");
        }
    } catch (error) {
        console.error("❌ Firebase Admin initialization failed:", error);
        console.error("Error details:", {
            hasProjectId: !!env.FIREBASE_PROJECT_ID,
            hasClientEmail: !!env.FIREBASE_CLIENT_EMAIL,
            hasPrivateKey: !!env.FIREBASE_PRIVATE_KEY,
            privateKeyLength: env.FIREBASE_PRIVATE_KEY?.length || 0,
        });
    }
} else {
    isFirebaseInitialized = true;
}

export const firebaseAdmin = admin;
export { isFirebaseInitialized, missingKeys };
