import React, { useState, useEffect } from "react";
import { Button, Modal, Alert, Typography } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const LocationCheckIn = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const targetLocation = { lat: 6.5243793, lng: 3.3792057 }; // target location (latitude, longitude)
  const maxDistance = 10000; // meters

  const generateToken = () => {
    return Math.random().toString(36).substr(2);
  };

  const storeTokenWithExpiration = (token) => {
    const expirationTime = new Date().getTime() + 24 * 60 * 60 * 1000;
    localStorage.setItem("token", token);
    localStorage.setItem("tokenExpiration", expirationTime);
  };

  const isTokenValid = () => {
    const expirationTime = localStorage.getItem("tokenExpiration");
    const currentTime = new Date().getTime();
    return currentTime < expirationTime;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
  };

  const checkLocation = () => {
    setModalVisible(true);
    setCheckInStatus(null);
    setErrorMessage("");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          // Log current location for debugging
          console.log("Current Location:", userLat, userLng);

          // Calculate the distance from target location
          const distance = calculateDistance(
            userLat,
            userLng,
            targetLocation.lat,
            targetLocation.lng
          );

          // Log calculated distance for debugging
          console.log("Calculated Distance:", distance);

          if (distance <= maxDistance) {
            setCheckInStatus("success");

            let token = isTokenValid()
              ? localStorage.getItem("token")
              : generateToken();

            if (!isTokenValid()) {
              token = generateToken();
              storeTokenWithExpiration(token);
            }

            // Inform user of success before redirection
            setErrorMessage(
              `You are within the allowed check-in area. Redirecting...`
            );

            setTimeout(() => {
              window.location.href = `https://script.google.com/macros/s/AKfycbwRlfXX71ODCTwiCnuKFgZKOCmyg0c68UfXkgFNC59MxJT26e95-2BZ1-updBuSdzIduQ/exec?token=${token}`;
            }, 2000); // Delay before redirection (2 seconds for example)
          } else {
            setCheckInStatus("error");
            setErrorMessage(
              `You are outside the allowed check-in area. Distance: ${Math.round(
                distance
              )} meters.`
            );
          }
        },
        (error) => {
          setCheckInStatus("error");
          setErrorMessage("Location permission denied or location not found.");
        }
      );
    } else {
      setCheckInStatus("error");
      setErrorMessage("Geolocation is not supported by this browser.");
    }
  };

  const handleModalClose = () => {
    if (checkInStatus === "error") {
      window.location.reload(); // Refresh page if there's an error
    } else {
      setModalVisible(false); // Close modal if success
      setCheckInStatus(null);
      setErrorMessage("");
    }
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 255, 255, 0.6); } 50% { transform: scale(1.2); box-shadow: 0 0 20px rgba(255, 255, 255, 1); } 100% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 255, 255, 0.6); } }
      @keyframes glow { 0% { text-shadow: 0 0 5px rgba(255, 255, 255, 0.6), 0 0 10px rgba(255, 255, 255, 0.5); } 50% { text-shadow: 0 0 15px rgba(255, 255, 255, 1), 0 0 25px rgba(255, 255, 255, 0.7); } 100% { text-shadow: 0 0 5px rgba(255, 255, 255, 0.6), 0 0 10px rgba(255, 255, 255, 0.5); } }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background:
          "linear-gradient(120deg, #3b1c4e, #10062f, #541452, #180a47)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 8s ease infinite",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "12px",
          padding: "30px",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
          zIndex: 2,
          maxWidth: "90%",
          width: "400px",
          backdropFilter: "blur(8px)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Title
          level={2}
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: "1.5rem",
            color: "#e2aaff",
            textShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          <EnvironmentOutlined
            style={{ fontSize: "1.5rem", marginRight: "10px" }}
          />
          Devs Check-In
        </Title>

        <Paragraph
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "1.3rem",
            color: "transparent",
            background: "linear-gradient(90deg, #faac63, #ff5e5e, #42aaff)",
            WebkitBackgroundClip: "text",
            textAlign: "center",
          }}
        >
          Please enable location access in your browser and check in to proceed
        </Paragraph>

        <Button
          type="primary"
          size="large"
          onClick={checkLocation}
          icon={<EnvironmentOutlined />}
          style={{
            fontFamily: "'Poppins', sans-serif",
            background: "transparent",
            color: "#faac63",
            border: "none",
            padding: "12px 30px",
            boxShadow: "0 0 10px rgba(250, 172, 99, 0.5)",
            transition: "all 0.3s ease",
          }}
        >
          Check In
        </Button>

        <Modal
          title={
            checkInStatus === "success"
              ? "Check-in Successful"
              : "Check-in Failed"
          }
          open={modalVisible}
          onCancel={handleModalClose}
          footer={[
            <Button
              key="back"
              onClick={handleModalClose}
              icon={
                checkInStatus === "success" ? (
                  <CheckCircleOutlined />
                ) : (
                  <CloseCircleOutlined />
                )
              }
              style={{
                backgroundColor:
                  checkInStatus === "success" ? "#4CAF50" : "#f44336",
                color: "white",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {checkInStatus === "success" ? "Proceed" : "Try Again"}
            </Button>,
          ]}
        >
          {checkInStatus === "success" ? (
            <Alert
              message="You have successfully checked in!"
              type="success"
              showIcon
            />
          ) : (
            <Alert message={errorMessage} type="error" showIcon />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default LocationCheckIn;
