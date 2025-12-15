import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Error boundary for uncaught errors
const root = document.getElementById("root");
if (!root) {
  document.body.innerHTML = "<h1>Error: Root element not found</h1>";
} else {
  try {
    createRoot(root).render(<App />);
  } catch (error) {
    console.error("Failed to render app:", error);
    document.body.innerHTML = `
      <div style="padding: 20px; font-family: monospace;">
        <h1>App Error</h1>
        <p>${error instanceof Error ? error.message : String(error)}</p>
        <p>Check browser console for details.</p>
      </div>
    `;
  }
}
