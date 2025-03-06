import { useEffect, useCallback } from "react";
import { notificationService } from "../services/notificationService";
import { useStore } from "../store/store.ts";
import { db } from "../lib/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

const NotificationInitializer = () => {
  const { user } = useStore();

  // Function to ensure user data is stored with email as document ID
  const ensureUserDataWithEmailId = async (email) => {
    if (!email) return null;
    try {
      // Convert email to a valid document ID (replace invalid characters)
      const emailId = email.toLowerCase().replace(/[.#$[\]]/g, "_");
      // Check if user exists with auto-generated ID
      const userRef = doc(db, "users", emailId);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        // If user doesn't exist with email ID, create/update it
        await setDoc(
          userRef,
          {
            email: email,
            lastActive: new Date(),
            // Add any other user data you want to store
          },
          { merge: true }
        );
        console.log("User data organized with email ID:", emailId);
      }
      // Create a path for submissions for this user
      const submissionsPath = `users/${emailId}/submissions`;
      console.log("Submissions path created for:", emailId);

      return { userRef, emailId, submissionsPath };
    } catch (error) {
      console.error("Error organizing user data:", error);
      return null;
    }
  };
  // Function to handle daily submission storage - using useCallback to fix the dependency issue
  const setupDailySubmissionStorage = useCallback(async (email) => {
    if (!email) return;

    try {
      const result = await ensureUserDataWithEmailId(email);
      if (result) {
        const { submissionsPath } = result;

        // Set up the submission path in the notification service
        notificationService.setSubmissionPath(submissionsPath);

        console.log("Daily submission storage configured for:", email);
      }
    } catch (error) {
      console.error("Error setting up daily submission storage:", error);
    }
  }, []);
  useEffect(() => {
    // Initialize notification system
    if ("Notification" in window) {
      // Request permission when component mounts
      if (
        Notification.permission !== "granted" &&
        Notification.permission !== "denied"
      ) {
        Notification.requestPermission();
      }

      // For development, show a test notification after a short delay
      const timer = setTimeout(() => {
        console.log("Attempting to show notification...");
        notificationService.testNotification();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);
  // Effect to organize user data when user is available
  useEffect(() => {
    if (user?.email) {
      setupDailySubmissionStorage(user.email);
    }
  }, [user, setupDailySubmissionStorage]);
  // This is a utility component that doesn't render anything
  return null;
};

export default NotificationInitializer;
