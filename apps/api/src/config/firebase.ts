import admin from "firebase-admin";
import { env } from "./env.js";

let isFirebaseInitialized = false;

if (!admin.apps.length) {
    try {
        if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
            console.warn("⚠️ Firebase Admin credentials missing. Firebase auth will fail.");
        } else {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: env.FIREBASE_PROJECT_ID,
                    clientEmail: env.FIREBASE_CLIENT_EMAIL,
                    privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
                }),
            });
            isFirebaseInitialized = true;
            console.log("✅ Firebase Admin initialized successfully");
        }
    } catch (error) {
        console.error("❌ Firebase Admin initialization failed:", error);
    }
} else {
    isFirebaseInitialized = true;
}

export const firebaseAdmin = admin;
export { isFirebaseInitialized };
