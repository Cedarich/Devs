import React, { useEffect, useRef } from "react";

const MatrixLoader = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Set canvas dimensions to cover the full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    const matrixCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    const drawMatrixEffect = () => {
      // Semi-transparent background to create fading effect
      context.fillStyle = "rgba(0, 0, 0, 0.05)";
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Set font style and color
      context.font = `${fontSize}px monospace`;
      context.fillStyle = "#faac63"; // Use the specified color

      drops.forEach((y, index) => {
        const text = matrixCharacters.charAt(
          Math.floor(Math.random() * matrixCharacters.length)
        );
        const x = index * fontSize;
        context.fillText(text, x, y * fontSize);

        // Reset drop when it reaches the bottom with a random reset chance
        if (y * fontSize > canvas.height && Math.random() > 0.975) {
          drops[index] = 0;
        }

        // Increment the drop position
        drops[index]++;
      });
    };

    const intervalId = setInterval(drawMatrixEffect, 50);

    // Resize canvas when the window is resized
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        backgroundColor: "#000",
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
};

export default MatrixLoader;
