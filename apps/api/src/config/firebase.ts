import admin from "firebase-admin";

// Diagnostic logging to check raw environment variables
console.log("RAW ENV:", {
  project: process.env.FIREBASE_PROJECT_ID,
  email: process.env.FIREBASE_CLIENT_EMAIL,
  key: !!process.env.FIREBASE_PRIVATE_KEY
});

let isFirebaseInitialized = false;
let missingKeys: string[] = [];

if (!admin.apps.length) {
    try {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

        // Check for undefined, null, or empty string values
        if (!projectId || projectId.trim() === '') missingKeys.push("FIREBASE_PROJECT_ID");
        if (!clientEmail || clientEmail.trim() === '') missingKeys.push("FIREBASE_CLIENT_EMAIL");
        if (!privateKeyRaw || privateKeyRaw.trim() === '') missingKeys.push("FIREBASE_PRIVATE_KEY");

        if (missingKeys.length > 0) {
            console.warn(`⚠️ Firebase Admin credentials missing: ${missingKeys.join(", ")}. Firebase auth will fail.`);
        } else {
            // Handle both escaped and unescaped newlines in private key
            let privateKey = privateKeyRaw!;
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
                    projectId: projectId,
                    clientEmail: clientEmail,
                    privateKey: privateKey,
                }),
            });
            isFirebaseInitialized = true;
            console.log("✅ Firebase Admin initialized successfully");
        }
    } catch (error) {
        console.error("❌ Firebase Admin initialization failed:", error);
        console.error("Error details:", {
            hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
            hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
            hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
            privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
            projectIdValue: process.env.FIREBASE_PROJECT_ID,
            clientEmailValue: process.env.FIREBASE_CLIENT_EMAIL,
            privateKeyValue: process.env.FIREBASE_PRIVATE_KEY ? 'SET' : 'NOT_SET',
        });
    }
} else {
    isFirebaseInitialized = true;
}

export const firebaseAdmin = admin;
export { isFirebaseInitialized, missingKeys };
