import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { AlertCircle, Loader2, PawPrint, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Use the reset-password page URL as the redirect
      await resetPassword(email);
      setSuccess(true);
      // Clear email after successful submission
      setEmail("");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send reset email. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="p-8">
            {/* Success Icon */}
            <div className="flex flex-col items-center justify-center gap-4 mb-8">
              <div className="p-3 rounded-xl bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-heading font-bold">Check Your Email</h1>
            </div>

            {/* Success Message */}
            <div className="mb-6 text-center space-y-3">
              <p className="text-muted-foreground">
                We've sent a password reset link to <strong>{email || 'your email'}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
            </div>

            {/* Footer */}
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/login")}
                className="w-full"
              >
                Back to Login
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Didn't receive the email?{" "}
                <button
                  onClick={() => setSuccess(false)}
                  className="text-primary hover:underline font-medium"
                >
                  Try again
                </button>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

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
              Reset Password
            </h1>
            <p className="text-sm text-muted-foreground">Enter your email address</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Reset Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
              <p className="text-xs text-muted-foreground">
                We'll send you a link to reset your password
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Footer */}
          <div className="space-y-3 text-sm text-muted-foreground text-center">
            <Link to="/login" className="text-primary hover:underline block font-medium">
              Back to Login
            </Link>
            <p>
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
