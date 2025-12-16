import { createRoot } from "react-dom/client";
import "./index.css";

console.log("✅ main.tsx loaded");

const root = document.getElementById("root");

if (!root) {
  console.error("❌ Root element not found!");
  document.body.innerHTML = "<h1>Error: Root element #root not found</h1>";
} else {
  // Show static content first
  root.innerHTML = `
    <div style="padding: 40px; font-family: Arial, sans-serif; background: #f5f5f5; min-height: 100vh;">
      <h1 style="color: #0066cc; margin: 0;">✅ Frontend Server is Working!</h1>
      <p style="font-size: 16px; color: #333;">Static HTML rendered successfully.</p>
      <p style="font-size: 14px; color: #666;">Loading React app...</p>
    </div>
  `;

  try {
    console.log("Importing App component...");
    
    // Dynamically import App to avoid module errors blocking the page
    import("./App.tsx").then((module) => {
      console.log("✅ App.tsx imported successfully");
      const App = module.default;
      
      console.log("Creating React root...");
      const reactRoot = createRoot(root);
      
      console.log("Rendering App component...");
      reactRoot.render(<App />);
      
      console.log("✅ React app rendered!");
    }).catch((err) => {
      console.error("❌ Failed to import App:", err);
      root.innerHTML = `
        <div style="padding: 40px; font-family: monospace; background: #ffebee; min-height: 100vh;">
          <h1 style="color: #d32f2f; margin: 0;">❌ Failed to Load React App</h1>
          <p style="color: #d32f2f;"><strong>Error:</strong> ${err.message}</p>
          <pre style="background: #fff; padding: 10px; overflow: auto; font-size: 12px; border: 1px solid #d32f2f;">
${err.stack}
          </pre>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Check browser console (F12) for details.
          </p>
        </div>
      `;
    });
  } catch (error) {
    console.error("❌ Synchronous error:", error);
  }
}

// Global error handler
window.addEventListener("error", (event) => {
  console.error("❌ Global error caught:", event.error);
  if (root) {
    root.innerHTML += `<div style="color: red; padding: 10px; background: #ffebee; margin: 10px;">Global Error: ${event.error.message}</div>`;
  }
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("❌ Unhandled rejection:", event.reason);
});
