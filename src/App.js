import React, { useEffect, useState } from "react";
import LocationCheckIn from "./component/LocationCheckn";
import "antd/dist/reset.css";
import { DownloadOutlined } from "@ant-design/icons"; // Import the Ant Design download icon
import MatrixLoader from "./component/MatrixLoader";

const App = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showLocationCheckIn, setShowLocationCheckIn] = useState(false);

  useEffect(() => {
    // Display MatrixLoader for 1 second before showing LocationCheckIn
    const loaderTimeout = setTimeout(() => {
      setShowLocationCheckIn(true);
    }, 3000);

    return () => clearTimeout(loaderTimeout); // Clear timeout on component unmount
  }, []);

  useEffect(() => {
    // Listen for the `beforeinstallprompt` event
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event); // Store the event so it can be triggered later
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt(); // Show the install prompt
      installPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
        } else {
          console.log("User dismissed the install prompt");
        }
        setInstallPrompt(null); // Clear the saved prompt
      });
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {!showLocationCheckIn && <MatrixLoader />}
      {showLocationCheckIn && <LocationCheckIn />}
      {/* Always show the button */}
      <button
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "80px",
          height: "80px",
          backgroundColor: "transparent",
          color: "#faac63", // Set the icon color to match the desired style
          border: "none",
          borderRadius: "50%", // Make the button round
          fontSize: "35px",
          cursor: "pointer",
          zIndex: 9999, // Ensure the button stays on top
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 0 10px rgba(250, 172, 99, 0.5)", // Soft glowing effect
          transition: "all 0.3s ease", // Smooth transition for animations
        }}
        onClick={handleInstallClick}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.1)"; // Slight zoom on hover
          e.target.style.boxShadow = "0 0 25px rgba(250, 172, 99, 0.8)"; // Brighter glow on hover
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)"; // Reset zoom effect
          e.target.style.boxShadow = "0 0 10px rgba(250, 172, 99, 0.5)"; // Reset glow
        }}
      >
        <DownloadOutlined /> {/* Use Ant Design's Download icon */}
      </button>
    </div>
  );
};

export default App;
