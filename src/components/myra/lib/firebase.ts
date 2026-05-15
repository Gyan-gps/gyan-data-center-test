import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// import { env } from "./env";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: "env.NEXT_PUBLIC_FIREBASE_API_KEY",
  authDomain: "env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  projectId: "env.NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  storageBucket: "env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  appId: "env.NEXT_PUBLIC_FIREBASE_APP_ID",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Export auth instance for use throughout the app
export const auth = getAuth(app);

export default app;
