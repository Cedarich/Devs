import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDEalr38awdostO35PyAEtkpn8VMjYxPy0",
  authDomain: "attendance-cd60e.firebaseapp.com",
  projectId: "attendance-cd60e",
  storageBucket: "attendance-cd60e.firebasestorage.app",
  messagingSenderId: "709899948787",
  appId: "1:709899948787:web:46ad9ba5a7bae1e0da5d86",
  measurementId: "G-7WJ8N2HL5Z",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Enable offline persistence
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.log("Persistence failed: Multiple tabs open");
    } else if (err.code === "unimplemented") {
      // The current browser does not support persistence
      console.log("Persistence not supported by this browser");
    }
  });
} catch (error) {
  console.error("IndexedDB persistence error:", error);
}
