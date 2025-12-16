import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { AlertCircle, Loader2, PawPrint, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, getSavedCredentials, clearSavedCredentials } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedEmail, setSavedEmail] = useState<string | null>(null);

  // Load saved email on mount
  useEffect(() => {
    const saved = getSavedCredentials();
    if (saved?.email) {
      setSavedEmail(saved.email);
      setEmail(saved.email);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to login. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <p className="text-sm text-muted-foreground">Monitor your pet's health</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="email">Email</Label>
                {savedEmail && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => {
                      clearSavedCredentials();
                      setSavedEmail(null);
                      setEmail("");
                      setPassword("");
                    }}
                    className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear saved
                  </motion.button>
                )}
              </div>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || isLoading}
                required
              />
              {savedEmail && email === savedEmail && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  ✓ Saved email
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting || isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
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
            <p>
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
            <Link to="/forgot-password" className="text-primary hover:underline block">
              Forgot password?
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
