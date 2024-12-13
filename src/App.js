import React, { useEffect, useState } from "react";
import LocationCheckIn from "./component/LocationCheckn";
import "antd/dist/reset.css";
import { DownloadOutlined } from "@ant-design/icons";
import Loader from "./component/Loader";

const App = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showLocationCheckIn, setShowLocationCheckIn] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Display MatrixLoader for 1 second before showing LocationCheckIn
    const loaderTimeout = setTimeout(() => {
      setShowLocationCheckIn(true);
    }, 2400);

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

  useEffect(() => {
    // Check if the app is already installed (using PWA install logic)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt(); // Show the install prompt
      installPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
          setIsInstalled(true); // Mark the app as installed
        } else {
          console.log("User dismissed the install prompt");
        }
        setInstallPrompt(null); // Clear the saved prompt
      });
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {!showLocationCheckIn && <Loader />}
      {showLocationCheckIn && (
        <div className="location-check-in-wrapper">
          <LocationCheckIn />
        </div>
      )}

      {/* Only show the install button if the app is not installed */}
      {!isInstalled && (
        <button
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "80px",
            height: "80px",
            backgroundColor: "transparent",
            color: "#faac63",
            border: "none",
            borderRadius: "50%",
            fontSize: "35px",
            cursor: "pointer",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 0 10px rgba(250, 172, 99, 0.5)",
            transition: "all 0.3s ease",
          }}
          onClick={handleInstallClick}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.1)";
            e.target.style.boxShadow = "0 0 25px rgba(250, 172, 99, 0.8)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0 0 10px rgba(250, 172, 99, 0.5)";
          }}
        >
          <DownloadOutlined />
        </button>
      )}

      <style>{`
        .location-check-in-wrapper {
          opacity: 0;
          transform: translateY(50px);
          animation: fadeInUp 1s ease-out forwards, glowEffect 2s infinite alternate;
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(50px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes glowEffect {
          0% {
            text-shadow: 0 0 10px rgba(250, 172, 99, 0.6);
          }
          50% {
            text-shadow: 0 0 20px rgba(250, 172, 99, 1);
          }
          100% {
            text-shadow: 0 0 10px rgba(250, 172, 99, 0.6);
          }
        }
      `}</style>
    </div>
  );
};

export default App;
