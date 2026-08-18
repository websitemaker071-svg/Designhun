import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// This config is not a secret — it's meant to be public in client-side code.
// Real protection comes from the Firestore security rules (see FIRESTORE_RULES.txt).
const firebaseConfig = {
  apiKey: "AIzaSyAlBfOodrcIbGGUYIeu6ek4FyioqiF14vU",
  authDomain: "design-hub-b8d9c.firebaseapp.com",
  projectId: "design-hub-b8d9c",
  storageBucket: "design-hub-b8d9c.firebasestorage.app",
  messagingSenderId: "132562841431",
  appId: "1:132562841431:web:6f7e420234ca5ca348d812",
  measurementId: "G-SDKQ601885",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
