import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: any;
let auth: any;
let googleProvider: any;

if (typeof window !== "undefined" || (firebaseConfig.apiKey && firebaseConfig.projectId)) {
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();
    } catch (error) {
        console.error("Firebase initialization failed:", error);
    }
} else {
    console.warn("Firebase env vars missing during build/SSR. Skipping initialization.");
    // Mock for build time to prevent crashes
    app = null;
    auth = { currentUser: null }; // Minimal mock to satisfy basic usage
    googleProvider = null;
}

export { app, auth, googleProvider };
