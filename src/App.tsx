import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";

const queryClient = new QueryClient();

// Minimal app to test
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <div style={{ padding: "40px", textAlign: "center", fontFamily: "sans-serif" }}>
              <h1>✅ PawSense is Loading...</h1>
              <p>If you see this message, the app is starting up!</p>
              <p>Please wait a moment and then navigate to a page.</p>
              <ul style={{ textAlign: "left", display: "inline-block" }}>
                <li><a href="/">Home</a></li>
                <li><a href="/login">Login</a></li>
                <li><a href="/signup">Signup</a></li>
              </ul>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
