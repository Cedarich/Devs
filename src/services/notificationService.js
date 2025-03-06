import { db } from "../lib/firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useStore } from "../store/store.ts";

// Service to handle notification functionality
export const notificationService = {
  // Check if notification should be shown today (weekday check)
  isWeekday() {
    const today = new Date();
    const day = today.getDay();
    // 0 is Sunday, 6 is Saturday
    return day !== 0 && day !== 6;
  },

  // Check if notification was already shown today
  hasNotifiedToday() {
    const { lastNotificationDate } = useStore.getState();
    const today = new Date().toISOString().split("T")[0];
    return lastNotificationDate === today;
  },
  // Show browser notification
  showBrowserNotification(
    title = "Attendance Reminder 🔔",
    body = "Please submit your attendance for today",
    icon = "/favicon.svg"
  ) {
    console.log("Attempting to show browser notification:", { title, body });

    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    console.log("Notification permission:", Notification.permission);

    if (Notification.permission === "granted") {
      // Check if service worker is available
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        // Use service worker for notifications with actions
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            body,
            icon,
            badge: icon,
            requireInteraction: true,
            actions: [
              {
                action: "submit",
                title: "Submit Attendance",
              },
            ],
          });
        });
      } else {
        // Fallback to regular notifications without actions
        const notification = new Notification(title, {
          body,
          icon,
          requireInteraction: true,
        });

        // Handle notification click
        notification.onclick = function () {
          window.focus();
          window.open("https://devsattendance.vercel.app/", "_blank");
          notification.close();
        };
      }

      return true;
    } else if (Notification.permission !== "denied") {
      console.log("Requesting notification permission...");
      Notification.requestPermission().then((permission) => {
        console.log("Permission result:", permission);
        if (permission === "granted") {
          this.showBrowserNotification(title, body, icon);
        }
      });
    }

    return false;
  },
  // Check and show notification if needed
  async checkAndShowNotification(email) {
    try {
      if (!email) return false;

      // Don't show on weekends
      if (!this.isWeekday()) return false;

      // Don't show if already notified today
      if (this.hasNotifiedToday()) return false;

      // Check if user already submitted attendance today
      const hasSubmittedToday = await this.checkTodaySubmission(email);
      if (hasSubmittedToday) return false;

      // All conditions met, show notification
      this.showBrowserNotification(
        "Attendance Reminder",
        "Please remember to submit your attendance for today."
      );

      // Mark as notified for today
      const { setLastNotificationDate } = useStore.getState();
      const today = new Date().toISOString().split("T")[0];
      setLastNotificationDate(today);

      return true;
    } catch (error) {
      console.error("Error checking notification:", error);
      return false;
    }
  },
  // Check if user already submitted attendance today
  async checkTodaySubmission(email) {
    try {
      const today = new Date().toISOString().split("T")[0];

      if (this.submissionPath) {
        // Use the user-specific path if available
        const submissionRef = doc(db, this.submissionPath, today);
        const docSnap = await getDoc(submissionRef);
        return docSnap.exists();
      } else {
        // Fall back to the old method
        const fullName = email.toLowerCase().trim().split("@")[0]; // Simple name extraction
        const submissionId = `${fullName}-${today}`.replace(
          /[^a-zA-Z0-9-]/g,
          ""
        );
        const submissionRef = doc(db, "submissions", submissionId);
        const docSnap = await getDoc(submissionRef);
        return docSnap.exists();
      }
    } catch (error) {
      console.error("Error checking today's submission:", error);
      return false;
    }
  },
  // Show the actual notification
  showNotification() {
    const { setLastNotificationDate } = useStore.getState();
    const today = new Date().toISOString().split("T")[0];

    // Show notification if browser supports it
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("Attendance Reminder", {
          body: "Hello dev, you haven't taken today's attendance.",
          icon: "/logo192.png", // Make sure this path is correct
        });
        setLastNotificationDate(today);
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification("Attendance Reminder", {
              body: "Hello dev, you haven't taken today's attendance.",
              icon: "/logo192.png", // Make sure this path is correct
            });
            setLastNotificationDate(today);
          }
        });
      }
    }
  },
  // Subscribe a user to daily notifications
  async subscribeToNotifications(email, time = "09:00") {
    try {
      const userId = email
        .toLowerCase()
        .trim()
        .replace(/[^a-zA-Z0-9]/g, "_");
      const notificationRef = doc(db, "notifications", userId);

      await setDoc(
        notificationRef,
        {
          email,
          enabled: true,
          preferredTime: time,
          lastNotified: null,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Update local state
      const { setNotificationsEnabled } = useStore.getState();
      setNotificationsEnabled(true);

      // Request notification permission
      if ("Notification" in window && Notification.permission !== "granted") {
        await Notification.requestPermission();
      }

      return true;
    } catch (error) {
      console.error("Error subscribing to notifications:", error);
      return false;
    }
  },
  // Unsubscribe a user from notifications
  async unsubscribeFromNotifications(email) {
    try {
      const userId = email
        .toLowerCase()
        .trim()
        .replace(/[^a-zA-Z0-9]/g, "_");
      const notificationRef = doc(db, "notifications", userId);

      await setDoc(
        notificationRef,
        {
          enabled: false,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Update local state
      const { setNotificationsEnabled } = useStore.getState();
      setNotificationsEnabled(false);

      return true;
    } catch (error) {
      console.error("Error unsubscribing from notifications:", error);
      return false;
    }
  },
  // Check if user is subscribed to notifications
  async checkNotificationStatus(email) {
    try {
      if (!email) return false;

      const userId = email
        .toLowerCase()
        .trim()
        .replace(/[^a-zA-Z0-9]/g, "_");
      const notificationRef = doc(db, "notifications", userId);
      const docSnap = await getDoc(notificationRef);

      const isEnabled = docSnap.exists()
        ? docSnap.data().enabled || false
        : false;

      // Update local state
      const { setNotificationsEnabled } = useStore.getState();
      setNotificationsEnabled(isEnabled);

      return isEnabled;
    } catch (error) {
      console.error("Error checking notification status:", error);
      return false;
    }
  },
  // Test function to manually trigger a notification (for development)
  testNotification() {
    console.log("Testing notification...");
    return this.showBrowserNotification(
      "Test Notification",
      "This is a test notification for development purposes."
    );
  },
};
