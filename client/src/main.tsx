import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Ensure favicon dynamically loads the latest Riad Atlas Acacia logo
try {
  let favicon = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!favicon) {
    favicon = document.createElement("link");
    favicon.rel = "icon";
    document.head.appendChild(favicon);
  }
  favicon.type = "image/png";
  favicon.href = `/favicon-32x32.png?v=3`;
} catch {
  // Ignore in non-browser env
}

createRoot(document.getElementById("root")!).render(<App />);

// Register PWA service worker for offline medina resilience
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        // Check for service worker cache update
        reg.update().catch(() => {});
      })
      .catch((err) => {
        console.warn("ServiceWorker registration failed:", err);
      });
  });
}
