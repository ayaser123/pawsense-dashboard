import { createRoot } from "react-dom/client";
import "./index.css";

console.log("✅ main.tsx loaded");

const root = document.getElementById("root");

if (!root) {
  console.error("❌ Root element not found!");
  document.body.innerHTML = "<h1>Error: Root element #root not found</h1>";
} else {
  // Show cute loading screen first
  root.innerHTML = `
    <div style="position: fixed; inset: 0; background: hsl(0 0% 100%); display: flex; align-items: center; justify-content: center; z-index: 50;">
      <div style="text-align: center; animation: fadeIn 0.6s ease-out;">
        <div style="font-size: 60px; margin-bottom: 24px; animation: bounce 2s infinite; animation-timing-function: ease-in-out;">
          🐾
        </div>
        <div style="margin-bottom: 24px;">
          <p style="font-size: 20px; font-weight: 600; color: #000; margin: 0; font-family: system-ui;">PawSense</p>
          <p style="font-size: 14px; color: #666; margin: 8px 0 0 0; font-family: system-ui;">Loading your experience...</p>
        </div>
        <div style="display: flex; justify-content: center; gap: 4px;">
          <div style="width: 4px; height: 4px; background: #8b5cf6; border-radius: 999px; animation: barBounce 1.2s infinite; animation-delay: 0ms;"></div>
          <div style="width: 4px; height: 4px; background: #ec4899; border-radius: 999px; animation: barBounce 1.2s infinite; animation-delay: 200ms;"></div>
          <div style="width: 4px; height: 4px; background: #8b5cf6; border-radius: 999px; animation: barBounce 1.2s infinite; animation-delay: 400ms;"></div>
        </div>
      </div>
      <style>
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes barBounce {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      </style>
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
