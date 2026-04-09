/**
 * Firebase Client SDK Configuration
 * Initializes only client-side with valid API key.
 */
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

function initFirebase() {
    if (typeof window === "undefined" || !firebaseConfig.apiKey) {
        return { app: undefined, auth: null, googleProvider: null, firestore: null };
    }
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    return {
        app,
        auth: getAuth(app),
        googleProvider: new GoogleAuthProvider(),
        firestore: getFirestore(app),
    };
}

const { app, auth, googleProvider, firestore } = initFirebase();

export { auth, googleProvider, firestore };
export default app;
