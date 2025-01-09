import React, { useState, useEffect } from "react";
import { Button, Modal, Alert, Typography } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const LocationCheckIn = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const targetLocation = { lat: 10.509145, lng: 7.42577 }; // target location (latitude, longitude)
  const maxDistance = 630000; // meters

  const generateToken = () => Math.random().toString(36).substr(2);

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
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
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

          const distance = calculateDistance(
            userLat,
            userLng,
            targetLocation.lat,
            targetLocation.lng
          );

          if (distance <= maxDistance) {
            setCheckInStatus("success");

            let token = isTokenValid()
              ? localStorage.getItem("token")
              : generateToken();

            if (!isTokenValid()) {
              token = generateToken();
              storeTokenWithExpiration(token);
            }
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
      window.location.reload();
    } else {
      setModalVisible(false);
      setCheckInStatus(null);
      setErrorMessage("");
    }
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes pulse {
        0% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 255, 255, 0.6); }
        50% { transform: scale(1.2); box-shadow: 0 0 20px rgba(255, 255, 255, 1); }
        100% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 255, 255, 0.6); }
      }
      @keyframes glow {
        0% { text-shadow: 0 0 5px rgba(255, 255, 255, 0.6), 0 0 10px rgba(255, 255, 255, 0.5); }
        50% { text-shadow: 0 0 15px rgba(255, 255, 255, 1), 0 0 25px rgba(255, 255, 255, 0.7); }
        100% { text-shadow: 0 0 5px rgba(255, 255, 255, 0.6), 0 0 10px rgba(255, 255, 255, 0.5); }
      }
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes lightningMove {
            0%, 100% { transform: translateX(0) translateY(0); }
            25% { transform: translateX(-5%) translateY(3%); }
            50% { transform: translateX(5%) translateY(-3%); }
            75% { transform: translateX(-3%) translateY(-2%); }
          }
      @keyframes typing { 
        0% { width: 0; } 
        100% { width: 100%; } 
      }
  
     


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
          "linear-gradient(120deg, #6a11cb, #2575fc, #ff0080, #40c9ff)",
        backgroundSize: "300% 300%",
        animation: "gradientShift 6s ease infinite",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Lightning Effects */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%), 
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%)`,
          mixBlendMode: "screen",
          animation: "lightningMove 4s infinite",
        }}
      ></div>

      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1))",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "16px",
          padding: "30px",
          textAlign: "center",
          boxShadow:
            "0 15px 40px rgba(0, 0, 0, 0.6), 0 0 10px #faac63, 0 0 20px rgba(255, 255, 255, 0.4)",
          zIndex: 2,
          maxWidth: "90%",
          width: "400px",
          backdropFilter: "blur(15px) saturate(1.5)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow =
            "0 20px 60px rgba(0, 0, 0, 0.8), 0 0 15px #faac63, 0 0 30px rgba(255, 255, 255, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow =
            "0 15px 40px rgba(0, 0, 0, 0.6), 0 0 10px #faac63, 0 0 20px rgba(255, 255, 255, 0.4)";
        }}
      >
        <Title
          level={2}
          className="location-check-title"
          style={{
            fontFamily: "'Pacifico', sans-serif",
            fontSize: "1.5rem",
            color: "#e0e0e0", // Main color, harmonized with app color
            overflow: "hidden",
            paddingRight: "10px",
            whiteSpace: "nowrap",
            animation:
              "typing 4s steps(30) 1s 1 normal, blink 0.75s step-end infinite",
            textShadow:
              "0 4px 8px rgba(0, 0, 0, 0.2), 0 0 30px rgba(250, 172, 99, 0.8), 0 0 10px rgba(250, 172, 99, 0.6)",
            letterSpacing: "1px", // Adds spacing to enhance the futuristic feel
            transform: "scale(1.05)", // Slight scaling for a modern effect
          }}
        >
          <EnvironmentOutlined
            style={{
              fontSize: "1.8rem", // Larger icon for Web3 feel
              marginRight: "10px",
              color: "#e0e0e0", // Harmonized with text color
            }}
          />
          Devs Check-In
        </Title>

        <Paragraph
          style={{
            fontFamily: "'Lato', sans-serif", // Futuristic font
            fontSize: "1.2rem", // Adjusted font size for better visibility
            color: "#e0e0e0",
            background: "linear-gradient(90deg, #42aaff, #ff5e5e, #f9a825)", // New gradient: bright blue, neon pink, and yellow
            WebkitBackgroundClip: "text", // To apply gradient to the text only
            textAlign: "center",
            position: "relative",
            textShadow: "0 0 10px #42aaff, 0 0 20px #f9a825, 0 0 30px #ff5e5e", // Glowing text effect with new colors
            letterSpacing: "2px", // Add spacing for a sleek feel
            animation:
              "glowText 1.5s ease-in-out infinite, slideIn 1s ease-out", // Glow and slide-in animation
          }}
        >
          Please enable location access and check in to proceed
        </Paragraph>
        <Button
          type="primary"
          size="large"
          onClick={checkLocation}
          icon={<EnvironmentOutlined />}
          style={{
            fontFamily: "'Pacifico', sans-serif",
            background: "transparent",
            color: "#fffff",
            border: "none",
            padding: "12px 30px",
            boxShadow: "0 0 10px rgba(250, 172, 99, 0.5)",
            transition: "all 0.3s ease",
            animation: "pulse 2s ease-out infinite",
          }}
        >
          Check-In
        </Button>

        <Modal
          title={
            checkInStatus === "success"
              ? "Check-in Successful"
              : "Check-in Failed"
          }
          open={modalVisible}
          onCancel={handleModalClose}
        >
          {checkInStatus === "success" ? (
            <div
              style={{
                background:
                  "linear-gradient(120deg, #6a11cb, #2575fc, #ff0080, #40c9ff)", // Matching gradient colors
                backgroundSize: "300% 300%", // Adjusting gradient size for smooth shifting
                animation: "gradientShift 6s ease infinite", // Apply shifting animation
                borderRadius: "15px", // Rounded corners for a sleek look
                padding: "20px", // Add padding for spacing inside the div
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)", // Soft shadow to add depth
                maxWidth: "800px", // Limit the width for better design control
                margin: "0 auto", // Center the div horizontally
                transition: "all 0.3s ease", // Smooth transition for hover effects
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "scale(1.03)"; // Slight zoom on hover
                e.target.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.2)"; // Stronger shadow on hover
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)"; // Reset zoom effect
                e.target.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)"; // Reset shadow
              }}
            >
              <Alert
                message={<>You have successfully checked in, please wait...</>}
                type="success"
                showIcon
                style={{
                  marginBottom: "20px", // Space between the Alert and iframe
                  fontSize: "16px", // Adjust font size for better readability
                  backgroundColor: "#fff4e5", // Light background to highlight the Alert
                  border: "1px solid #faac63", // Border matching the main color
                }}
              />
              <iframe
                src={`https://forms.gle/hrHPGsz73v7uCgoD6`}
                width="100%"
                height="400"
                style={{
                  border: "none",
                  borderRadius: "10px", // Rounded corners for the iframe
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)", // Subtle shadow on iframe
                  marginTop: "20px",
                  transition: "all 0.3s ease", // Smooth transition for hover effect
                }}
                title="Devs Attendance"
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.03)"; // Slight zoom on hover
                  e.target.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.2)"; // Stronger shadow on hover
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)"; // Reset zoom effect
                  e.target.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)"; // Reset shadow
                }}
              />
            </div>
          ) : (
            <Alert message={errorMessage} type="error" showIcon />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default LocationCheckIn;
