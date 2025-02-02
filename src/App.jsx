import React, { useEffect } from "react";
import AttendanceForm from "./component/AttendanceForm";
import "antd/dist/reset.css";
import { DownloadOutlined } from "@ant-design/icons";
import Loader from "./component/Loader";
import { useStore } from "./store/store.ts";
import { motion } from "framer-motion";

const App = () => {
  const { 
    installPrompt,
    isInstalled,
    showLocationCheckIn,
    setInstallPrompt,
    setIsInstalled,
    setShowLocationCheckIn
  } = useStore();

  useEffect(() => {
    // Display MatrixLoader for 1 second before showing LocationCheckIn
    const loaderTimeout = setTimeout(() => {
      setShowLocationCheckIn(true);
    }, 2400);

    return () => clearTimeout(loaderTimeout); // Clear timeout on component unmount
  }, [setShowLocationCheckIn]);

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
  }, [setInstallPrompt]);

  useEffect(() => {
    // Check if the app is already installed (using PWA install logic)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }
  }, [setIsInstalled]);

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

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      // Store the event to trigger later
      const deferredPrompt = e;
      // Show install button logic here
    });
  }, []);

  return (
    <div className="main-container" style={{ 
      position: "relative", 
      minHeight: "100vh", 
      overflow: "hidden",
      background: "#0a0a1a" // Dark space-like background
    }}>
      {/* Snowfall Container */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 0
        }}
      >
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              background: 'rgba(255, 255, 255, 0.3)',
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              borderRadius: '50%',
              filter: 'blur(2px)',
              left: `${Math.random() * 100}%`,
              top: '-10%'
            }}
            animate={{
              y: '120vh',
              opacity: [0, 0.8, 0],
              rotate: Math.random() * 360,
              x: `${Math.random() * 20 - 10}%`
            }}
            transition={{
              duration: Math.random() * 10 + 8,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'linear'
            }}
          />
        ))}
      </div>

      {!showLocationCheckIn && (
        <div className="loader-background">
          <Loader />
        </div>
      )}
      {showLocationCheckIn && <AttendanceForm />}

      {/* Only show the install button if the app is not installed */}
      {!isInstalled && (
        <motion.button
          onClick={handleInstallClick}
          style={{
            position: "fixed",
            bottom: '2vmin',
            right: '2vmin',
            width: 'clamp(60px, 12vw, 80px)',
            height: 'clamp(60px, 12vw, 80px)',
            background: `
              radial-gradient(
                circle at 75% 30%,
                rgba(64,169,255,0.4) 0%,
                rgba(255,56,100,0.2) 100%
              ),
              rgba(24,26,48,0.6)
            `,
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(64,169,255,0.3)',
            borderRadius: "50%",
            cursor: "pointer",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: `
              0 0 25px rgba(64,169,255,0.3),
              0 0 15px rgba(255,56,100,0.2),
              inset 0 0 10px rgba(255,255,255,0.1)
            `,
            transform: 'translateZ(0)'
          }}
          whileHover={{
            scale: 1.1,
            boxShadow: `
              0 0 35px rgba(64,169,255,0.5),
              0 0 25px rgba(255,56,100,0.3),
              inset 0 0 15px rgba(255,255,255,0.2)
            `,
            transition: { duration: 0.3 }
          }}
          whileTap={{ 
            scale: 0.95,
            boxShadow: `
              0 0 15px rgba(64,169,255,0.2),
              inset 0 0 5px rgba(255,255,255,0.1)
            `
          }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
        >
          <DownloadOutlined 
            style={{
              color: '#a2d5ff',
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              filter: 'drop-shadow(0 0 8px rgba(64,169,255,0.5))'
            }}
          />
        </motion.button>
      )}
    </div>
  );
};

export default App;
