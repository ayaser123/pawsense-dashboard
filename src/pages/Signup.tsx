import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { AlertCircle, Loader2, PawPrint, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Signup = () => {
  const navigate = useNavigate();
  const { signup, isLoading, checkEmailExists } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Removed dev-only email confirm control per assignment requirements
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    // Validation
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      setIsSubmitting(false);
      return;
    }

    if (formData.fullName.length > 50) {
      setError("Full name must be 50 characters or fewer");
      setIsSubmitting(false);
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      setIsSubmitting(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    // Check if email already exists in Supabase (backend check)
    try {
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        setError("This email is already registered. Please login or use a different email.");
        setIsSubmitting(false);
        return;
      }
    } catch (err) {
      console.error("Error checking email:", err);
      setError("Could not verify email. Please try again.");
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsSubmitting(false);
      return;
    }

    if (!acceptedTerms) {
      setError("You must accept the terms and privacy policy");
      setIsSubmitting(false);
      return;
    }

    try {
      await signup(formData.email, formData.password, {
        full_name: formData.fullName,
      });
      
      if (import.meta.env.DEV) {
        // In dev mode, email is auto-confirmed and user is auto-logged in
        setSuccess("✅ Signup successful! Logging you in...");
        setTimeout(() => navigate("/dashboard", { replace: true }), 500);
      } else {
        // In production, user must confirm email first
        setSuccess("✅ Signup successful! Check your email to confirm your account.");
        setTimeout(() => navigate("/confirm-email", { replace: true }), 2000);
      }
    } catch (err) {
      let errorMessage = "Failed to signup. Please try again."
      
      console.error("[SIGNUP] Raw error:", err)
      console.error("[SIGNUP] Error type:", typeof err)
      console.error("[SIGNUP] Error instanceof Error:", err instanceof Error)
      
      if (err instanceof Error) {
        errorMessage = err.message
        console.error("[SIGNUP] Extracted from Error.message:", errorMessage)
      } else if (typeof err === "string") {
        errorMessage = err
        console.error("[SIGNUP] Extracted from string:", errorMessage)
      } else if (err && typeof err === "object") {
        // Try multiple paths to extract the message
        const errorObj = err as Record<string, unknown>
        console.error("[SIGNUP] Error object keys:", Object.keys(errorObj))
        
        errorMessage = 
          (errorObj.message as string) ||
          (errorObj.error as string) ||
          (errorObj.details as string) ||
          (typeof errorObj.toString === 'function' ? errorObj.toString() : JSON.stringify(err))
        
        console.error("[SIGNUP] Extracted from object:", errorMessage)
      }
      
      console.error("[SIGNUP] Final error message:", errorMessage)
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dev-only confirm button removed

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-primary/10">
              <PawPrint className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-heading font-bold">
              Paw<span className="text-primary">Sense</span>
            </h1>
            <p className="text-sm text-muted-foreground">Create your account</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isSubmitting || isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting || isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting || isLoading}
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isSubmitting || isLoading}
                  required
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <input
                id="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                disabled={isSubmitting || isLoading}
                className="h-4 w-4"
              />
              <Label htmlFor="terms">I accept the Terms and Privacy Policy</Label>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>

          {/* Character counter for full name */}
          <p className="text-xs text-muted-foreground mt-2">
            Name length: {formData.fullName.length}/50
          </p>

          {/* Dev-only confirm email UI removed */}

          {/* Footer */}
          <div className="mt-6 text-sm text-muted-foreground text-center">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Login
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;
