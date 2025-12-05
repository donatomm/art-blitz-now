// Force rebuild: 2025-12-05T10:35:00Z
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("=== MAIN.TSX LOADING ===");

try {
  const rootElement = document.getElementById("root");
  console.log("Root element found:", !!rootElement);
  
  if (rootElement) {
    console.log("Creating React root...");
    const root = createRoot(rootElement);
    console.log("Rendering App...");
    root.render(<App />);
    console.log("App rendered successfully");
  } else {
    console.error("Root element not found!");
  }
} catch (error) {
  console.error("Error rendering app:", error);
}
