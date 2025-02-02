import React from "react";
import ReactDOM from "react-dom/client"; // Update to the new API
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const root = ReactDOM.createRoot(document.getElementById("root"));

// Add before ReactDOM.render()
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  // Store event for later use
  window.deferredPrompt = e;
});

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

serviceWorkerRegistration.register();
