import React, { useContext } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, AuthContext } from "@/contexts/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLoadingScreen } from "@/components/AppLoadingScreen";

// Pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import VetFinder from "@/pages/VetFinder";
import Telehealth from "@/pages/Telehealth";
import Alerts from "@/pages/Alerts";
import Contact from "@/pages/Contact";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

// Inner app component that can use AuthContext
const AppRoutes = () => {
  const { isLoading } = useContext(AuthContext)!;

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/vet-finder" element={<ProtectedRoute><VetFinder /></ProtectedRoute>} />
        <Route path="/telehealth" element={<ProtectedRoute><Telehealth /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  console.log("✅ App component rendering");

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AppRoutes />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
