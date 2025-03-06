import React, { useState, useEffect, useCallback } from "react";
import { Switch, TimePicker, message, Typography, Space } from "antd";
import { BellOutlined, BellFilled } from "@ant-design/icons";
import { notificationService } from "../services/notificationService";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { useStore } from "../store/store.ts";

const NotificationToggle = ({ email }) => {
  const { notificationsEnabled } = useStore();
  const [preferredTime, setPreferredTime] = useState(dayjs("09:00", "HH:mm"));
  const [loading, setLoading] = useState(false);

  const checkNotificationStatus = useCallback(async () => {
    if (!email) return;

    setLoading(true);
    try {
      await notificationService.checkNotificationStatus(email);
    } catch (error) {
      console.error("Error checking notification status:", error);
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    if (email) {
      checkNotificationStatus();
    }
  }, [email, checkNotificationStatus]);

  const handleToggleNotifications = async (checked) => {
    if (!email) {
      message.error("Please enter your email first");
      return;
    }

    setLoading(true);
    try {
      if (checked) {
        const timeString = preferredTime.format("HH:mm");
        const success = await notificationService.subscribeToNotifications(
          email,
          timeString
        );
        if (success) {
          message.success("You will receive weekday attendance reminders");

          // Request notification permission if not already granted
          if (
            "Notification" in window &&
            Notification.permission !== "granted"
          ) {
            await Notification.requestPermission();
          }
        } else {
          message.error("Failed to enable notifications");
        }
      } else {
        const success =
          await notificationService.unsubscribeFromNotifications(email);
        if (success) {
          message.info("Notifications turned off");
        } else {
          message.error("Failed to disable notifications");
        }
      }
    } catch (error) {
      console.error("Error toggling notifications:", error);
      message.error("Failed to update notification settings");
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (time) => {
    if (!time) return;
    setPreferredTime(time);
    if (notificationsEnabled && email) {
      notificationService.subscribeToNotifications(email, time.format("HH:mm"));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: "rgba(20, 22, 50, 0.6)",
        padding: "15px",
        borderRadius: "12px",
        marginTop: "20px",
        border: "1px solid rgba(90, 200, 250, 0.2)",
      }}
    >
      <Typography.Title
        level={5}
        style={{ color: "#5ac8fa", marginBottom: "15px" }}
      >
        Weekday Reminders
      </Typography.Title>

      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space>
            {notificationsEnabled ? (
              <BellFilled style={{ color: "#5ac8fa", fontSize: "20px" }} />
            ) : (
              <BellOutlined style={{ color: "#5ac8fa", fontSize: "20px" }} />
            )}
            <Typography.Text style={{ color: "#fff" }}>
              Attendance Reminders (Mon-Fri)
            </Typography.Text>
          </Space>

          <Switch
            checked={notificationsEnabled}
            onChange={handleToggleNotifications}
            loading={loading}
            style={{
              backgroundColor: notificationsEnabled ? "#5ac8fa" : undefined,
            }}
          />
        </div>

        {notificationsEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Typography.Text
              style={{ color: "#ccc", display: "block", marginBottom: "8px" }}
            >
              Preferred reminder time:
            </Typography.Text>
            <TimePicker
              use12Hours
              format="h:mm A"
              value={preferredTime}
              onChange={handleTimeChange}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                borderColor: "rgba(90, 200, 250, 0.3)",
                color: "#fff",
                width: "100%",
              }}
            />
          </motion.div>
        )}
      </Space>
    </motion.div>
  );
};

export default NotificationToggle;
