// import React, { useState } from 'react';
import { Form, Input, Button, DatePicker, message, Typography } from "antd";
import {
  UserOutlined,
  CommentOutlined,
  RocketOutlined,
  // CheckCircleOutlined,
} from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { db } from "../lib/firebaseConfig";
import {
  serverTimestamp,
  doc,
  getDoc,
  // setDoc, // Removed unused import
  collection,
  addDoc, // Added this new import
} from "firebase/firestore";
import { useStore } from "../store/store.ts";
import { useRef } from "react";

const AttendanceForm = () => {
  const [form] = Form.useForm();
  const {
    setLoading,
    submitProgress,
    setSubmitProgress,
    showGuide,
    setShowGuide,
  } = useStore();
  const fieldRef = useRef(null);

  const onFinish = async (values) => {
    setLoading(true);
    setSubmitProgress(30);
    try {
      if (!navigator.onLine) {
        throw new Error("Internet connection required to submit attendance");
      }
      const today = new Date().toISOString().split("T")[0];
      const firstName = values.firstName?.trim() || "";
      const lastName = values.lastName?.trim() || "";
      const fullName = `${values.firstName} ${values.lastName}`
        .toLowerCase()
        .trim();

      if (!firstName || !lastName) {
        throw new Error("Both first and last name are required");
      }

      if (!/^[A-Za-z]+$/.test(firstName)) {
        throw new Error("First name must contain only letters");
      }

      if (!/^[A-Za-z]+$/.test(lastName)) {
        throw new Error("Last name must contain only letters");
      }

      if (!values.email || !values.email.includes("@")) {
        throw new Error("Valid email address is required");
      }

      // Simplified approach using addDoc instead of setDoc with custom IDs
      try {
        // Check if user already submitted today
        const submissionId = `${fullName}-${today}`.replace(
          /[^a-zA-Z0-9-]/g,
          ""
        );
        const submissionDocRef = doc(db, "submissions", submissionId);
        const submissionDocSnap = await getDoc(submissionDocRef);

        if (submissionDocSnap.exists()) {
          throw new Error(`❌ ${values.firstName} already submitted today!`);
        }

        // Create submission using addDoc instead of setDoc
        await addDoc(collection(db, "submissions"), {
          name: fullName,
          email: values.email.toLowerCase().trim(),
          date: today,
          timestamp: serverTimestamp(),
          submissionId: submissionId, // Store the ID as a field
        });

        // Create or update user document
        const userId = values.email
          .toLowerCase()
          .trim()
          .replace(/[^a-zA-Z0-9]/g, "_");
        const userDocRef = doc(db, "users", userId);

        try {
          // Check if user exists
          const userDocSnap = await getDoc(userDocRef);

          // Initialize submissions array
          const existingSubmissions = userDocSnap.exists()
            ? userDocSnap.data().submissions || []
            : [];

          // Create or update user document with new submission
          const updatedSubmissions = [...existingSubmissions, { date: today }];

          await addDoc(collection(db, "users"), {
            email: values.email.toLowerCase().trim(),
            name: fullName,
            submissions: updatedSubmissions,
            lastUpdated: serverTimestamp(),
            userId: userId, // Store the ID as a field
          });
        } catch (userError) {
          console.error("User document error:", userError);
          // Continue even if user document fails - at least the submission was recorded
        }
      } catch (firestoreError) {
        console.error("Firestore error:", firestoreError);

        if (firestoreError.code === "permission-denied") {
          throw new Error(
            "Database access denied. Please check your connection or contact administrator."
          );
        } else if (firestoreError.message.includes("already submitted")) {
          throw firestoreError; // Re-throw the "already submitted" error
        } else {
          throw new Error(
            "Failed to submit attendance. Please try again later."
          );
        }
      }

      setSubmitProgress(70);
      await new Promise((resolve) => {
        message.success({
          content: `Attendance recorded! 🎉`,
          duration: 2,
          onClose: resolve,
        });
      });
      setSubmitProgress(100);
      form.resetFields();
    } catch (error) {
      console.error("Submission error:", error);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Remove or comment out the unused checkConsecutiveDays function
  // const checkConsecutiveDays = (submissions) => {
  //   if (!submissions || submissions.length === 0) return 0;
  //
  //   const sortedDates = submissions
  //     .map(s => new Date(s.date))
  //     .sort((a, b) => b - a); // Sort descending
  //
  //   let streak = 0;
  //   let currentDate = new Date();
  //   currentDate.setHours(0, 0, 0, 0); // Normalize time
  //
  //   for (const date of sortedDates) {
  //     const compareDate = new Date(date);
  //     compareDate.setHours(0, 0, 0, 0);
  //
  //     if (compareDate.getTime() === currentDate.getTime()) {
  //       streak++;
  //       currentDate.setDate(currentDate.getDate() - 1);
  //     } else {
  //       break;
  //     }
  //   }
  //   return streak;
  // };

  // Create style constants
  const inputStyle = {
    background: `linear-gradient(45deg, #141632, #141632) padding-box,
                 linear-gradient(45deg, #5ac8fa, #ff3864) border-box`,
    border: "1px solid rgba(255, 255, 255, 0.15)",
    color: "#fff",
    borderRadius: "8px",
    padding: "12px 20px",
    transition: "all 0.3s ease",

    backgroundClip: "padding-box, border-box",
    "@media (max-width: 600px)": {
      width: "100%",
      minWidth: "unset",
    },
  };

  const labelStyle = {
    color: "#5ac8fa",
    fontWeight: 500,
  };

  const buttonStyle = {
    background: "linear-gradient(45deg, #5ac8fa, #ff3864)",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    padding: "14px 28px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 15px rgba(90, 200, 250, 0.3)",
    },
    ":before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: "-100%",
      width: "100%",
      height: "100%",
      background:
        "linear-gradient(120deg, transparent, rgba(255,255,255,0.3), transparent)",
      transition: "all 0.6s ease",
    },
    ":hover:before": {
      left: "100%",
    },
  };

  // Progress bar style
  const progressStyle = {
    height: "12px",
    borderRadius: "20px",
    background: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    position: "relative",
    margin: "20px 0",
  };

  const progressFillStyle = {
    height: "100%",
    background: "linear-gradient(90deg, #ff9a9e, #fad0c4)",
    borderRadius: "20px",
    width: `${submitProgress}%`,
    transition: "width 0.5s ease",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, type: "spring" }}
      // Update the motion.div container styles (lines 47-58)
      style={{
        maxWidth: "min(90%, 600px)",
        margin: "auto",
        padding: "clamp(20px, 5vh, 40px)",
        background:
          "linear-gradient(145deg, rgba(16,18,35,0.9) 0%, rgba(23,25,50,0.9) 100%)",
        borderRadius: "20px",
        border: "1px solid rgba(90, 200, 250, 0.3)",
        boxShadow:
          "0 0 50px rgba(90, 200, 250, 0.2), 0 8px 32px rgba(0, 0, 0, 0.3)",
        backdropFilter: "blur(16px) saturate(200%)",
        position: "relative",
        overflow: "hidden",
        transform: "translateY(-5%)", // Remove this if exists
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              background: "rgba(255, 255, 255, 0.3)",
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              borderRadius: "50%",
              filter: "blur(2px)",
              left: `${Math.random() * 100}%`,
              top: "-10%",
            }}
            animate={{
              y: "120vh",
              opacity: [0, 0.8, 0],
              rotate: Math.random() * 360,
              x: `${Math.random() * 20 - 10}%`,
            }}
            transition={{
              duration: Math.random() * 10 + 8,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <motion.div
        style={{
          position: "absolute",
          top: "20%",
          left: "10%",
          width: "100px",
          height: "100px",
          background:
            "radial-gradient(circle, rgba(90,200,250,0.15) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
        animate={{
          y: [-20, 20, -20],
          x: [0, 15, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            background: `rgba(${Math.random() * 100},${Math.random() * 100},250,0.1)`,
            width: `${Math.random() * 50 + 50}px`,
            height: `${Math.random() * 50 + 50}px`,
            borderRadius: "50%",
            filter: "blur(20px)",
          }}
          initial={{
            opacity: 0,
            y: Math.random() * 100 - 50,
            x: Math.random() * 100 - 50,
          }}
          animate={{
            opacity: [0, 0.3, 0],
            y: [0, Math.random() * 100 - 50],
            x: [0, Math.random() * 100 - 50],
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
      ))}

      <motion.div
        className="form-glow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
      />

      <RocketOutlined
        style={{
          position: "absolute",
          fontSize: "4rem",
          opacity: 0.1,
          top: 20,
          right: 20,
          color: "#5ac8fa",
        }}
      />

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Typography.Title
          level={2}
          style={{
            textAlign: "center",
            marginBottom: 40,
            background: "linear-gradient(45deg, #40a9ff, #ff3864)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 20px rgba(64,169,255,0.3)",
            fontSize: "2.5rem",
            fontWeight: 700,
            letterSpacing: "2px",
          }}
        >
          Devs Attendance
        </Typography.Title>
      </motion.div>

      <Form
        form={form}
        name="attendance_form"
        onFinish={onFinish}
        layout="vertical"
        scrollToFirstError
      >
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <Form.Item
            name="firstName"
            label={<span style={labelStyle}>FIRST NAME</span>}
            rules={[{ required: true, message: "First name is required" }]}
            style={{ flex: 1, minWidth: "200px" }}
          >
            <Input
              style={{ ...inputStyle, width: "100%" }}
              prefix={<UserOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="lastName"
            label={<span style={labelStyle}>LAST NAME</span>}
            rules={[{ required: true, message: "Last name is required" }]}
            style={{ flex: 1, minWidth: "200px" }}
          >
            <Input
              style={{ ...inputStyle, width: "100%" }}
              prefix={<UserOutlined />}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="email"
          label={<span style={labelStyle}>EMAIL</span>}
          rules={[
            { required: true, message: "Please input your Gmail!" },
            {
              pattern: /^[a-zA-Z0-9]+@gmail\.com$/i,
              message: "Invalid Gmail format",
            },
          ]}
        >
          <Input
            style={inputStyle}
            type="email"
            placeholder="johndoe2023@gmail.com"
            autoComplete="email"
            onChange={(e) => (e.target.value = e.target.value.toLowerCase())}
          />
        </Form.Item>

        <Form.Item name="date" label={<span style={labelStyle}>DATE</span>}>
          <DatePicker
            style={{ ...inputStyle, width: "100%" }}
            format="YYYY-MM-DD"
            disabledDate={(current) => {
              const today = dayjs().startOf("day");
              return !current.isSame(today, "day");
            }}
            inputReadOnly
          />
        </Form.Item>

        <Form.Item
          name="comments"
          label={
            <span style={{ color: "#5ac8fa", fontWeight: 500 }}>COMMENTS</span>
          }
        >
          <TextArea
            ref={fieldRef}
            rows={4}
            prefix={<CommentOutlined />}
            placeholder="Additional comments..."
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#fff",
              borderRadius: "8px",
              padding: "12px 20px",
              transition: "all 0.3s ease",
            }}
          />
        </Form.Item>

        <Form.Item>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button type="primary" htmlType="submit" style={buttonStyle}>
              Submit Attendance
            </Button>
          </div>
        </Form.Item>
      </Form>

      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          border: "2px solid transparent",
          borderRadius: "20px",
          pointerEvents: "none",
        }}
        animate={{
          borderColor: [
            "rgba(90, 200, 250, 0.3)",
            "rgba(255, 120, 117, 0.3)",
            "rgba(90, 200, 250, 0.3)",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
      />

      <div style={progressStyle}>
        <div style={progressFillStyle}>
          <div
            style={{
              position: "absolute",
              right: "-20px",
              top: "-5px",
              fontSize: "24px",
            }}
          >
            {submitProgress >= 100 ? "🎉" : "🐾"}
          </div>
        </div>
      </div>

      {showGuide && (
        <div
          style={{
            background: "rgba(255, 236, 179, 0.2)",
            border: "2px solid #ffd8a8",
            borderRadius: "16px",
            padding: "20px",
            margin: "24px 0",
            position: "relative",
            backdropFilter: "blur(5px)",
          }}
        >
          <span
            onClick={() => setShowGuide(false)}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              cursor: "pointer",
              fontSize: "24px",
              color: "#ff7e67",
              padding: "8px",
              transition: "transform 0.2s ease",
              ":hover": {
                transform: "scale(1.2)",
              },
            }}
          >
            ×
          </span>

          {/* Cute emoji bubble */}
          <div
            style={{
              position: "absolute",
              top: "-20px",
              left: "-20px",
              width: "60px",
              height: "60px",
              background: "#ffd700",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "28px",
              boxShadow: "0 4px 12px rgba(255, 215, 0, 0.3)",
            }}
          >
            🐣
          </div>

          <h4
            style={{
              color: "#ff7e67",
              marginBottom: "16px",
              fontSize: "1.2rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "24px" }}>💡</span>
            Daily Tips
          </h4>

          <ul
            style={{
              color: "#6c757d",
              paddingLeft: "24px",
              margin: 0,
              listStyleType: "🐾",
            }}
          >
            <li style={{ padding: "4px 0" }}>One submission per day</li>
            <li style={{ padding: "4px 0" }}>Use your real name</li>
            <li style={{ padding: "4px 0" }}>Double-check email</li>
          </ul>
        </div>
      )}

      <style>
        {`
          .ant-input::placeholder {
            color: rgba(255, 255, 255, 0.4) !important;
          }
          .ant-picker-input input::placeholder {
            color: rgba(255, 255, 255, 0.4) !important;
          }
          .ant-picker-suffix .anticon {
            color: #fff !important;
            transition: all 0.3s ease;
          }
          .ant-picker-suffix:hover .anticon {
            color: #40a9ff !important;
          }
        `}
      </style>
    </motion.div>
  );
};

export default AttendanceForm;
