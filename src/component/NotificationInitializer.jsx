import { useEffect, useCallback } from "react";
import { notificationService } from "../services/notificationService";
import { useStore } from "../store/store.ts";
import { db } from "../lib/firebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

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

      // If user doesn't exist with email ID, check if it exists with auto-generated ID
      if (!userDoc.exists()) {
        // Query for user with this email
        const usersCollection = collection(db, "users");
        const q = query(usersCollection, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        // If found with auto-generated ID, migrate the data
        if (!querySnapshot.empty) {
          const oldUserDoc = querySnapshot.docs[0];
          const oldData = oldUserDoc.data();

          // Create new document with email ID
          await setDoc(userRef, {
            ...oldData,
            email: email,
            lastActive: new Date(),
            migratedFrom: oldUserDoc.id, // Keep track of the old ID
          });

          console.log(
            "User data migrated from auto-generated ID to email ID:",
            emailId
          );
        } else {
          // If user doesn't exist at all, create it
          await setDoc(
            userRef,
            {
              email: email,
              lastActive: new Date(),
            },
            { merge: true }
          );
          console.log("New user data created with email ID:", emailId);
        }
      } else {
        // Update last active time
        await setDoc(
          userRef,
          {
            lastActive: new Date(),
          },
          { merge: true }
        );
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

  // Rest of the component remains unchanged
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
