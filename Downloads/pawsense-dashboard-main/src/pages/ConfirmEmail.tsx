import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { Mail, CheckCircle, AlertCircle, Loader2, PawPrint } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ConfirmEmail() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<"waiting" | "confirming" | "success" | "error">("waiting");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Check if there's a confirmation token in the URL hash (from email link)
        const params = new URLSearchParams(window.location.hash.substring(1))
        const token = params.get("access_token")
        const type = params.get("type")

        if (!token) {
          // No token - check if user is already logged in with confirmed email
          const { data } = await supabase.auth.getSession()
          if (data.session?.user?.email_confirmed_at) {
            setStatus("success")
            setTimeout(() => {
              navigate("/dashboard", { replace: true })
            }, 2000)
            return
          }
          // In dev mode, allow auto-confirmation
          if (import.meta.env.DEV && data.session?.user) {
            console.log("ℹ️ Dev mode: Email confirmation is skipped. Check Supabase project settings to enable email confirmation.")
          }
          setStatus("waiting")
          return
        }

        // Token found, verify it
        setStatus("confirming")
        const { error, data } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "email",
        })

        if (error) throw error
        if (!data.user) throw new Error("Email confirmation failed")

        setStatus("success")
        setTimeout(() => {
          navigate("/dashboard", { replace: true })
        }, 2000)
      } catch (err) {
        console.error("Email confirmation error:", err)
        setStatus("error")
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Failed to confirm email. Please try again or contact support."
        )
      }
    }

    confirmEmail()
  }, [navigate])

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Email Confirmed!</h1>
            <p className="text-muted-foreground mb-6">
              Your email has been successfully confirmed. You're being redirected to your dashboard...
            </p>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg mx-auto"
      >
        <Card className="p-10 space-y-6">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <PawPrint className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-heading font-bold">
              Paw<span className="text-primary">Sense</span>
            </h1>
            <p className="text-sm text-muted-foreground">Confirm your email</p>
          </div>

          {/* Status Alert */}
          {status === "confirming" && (
            <Alert className="border-blue-200 bg-blue-50">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              <AlertDescription className="text-blue-800">Confirming your email...</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {status === "waiting" && (
            <>
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-primary/10">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>

              <div className="space-y-4 text-center">
                <h2 className="text-lg font-bold text-foreground">
                  Confirm Your Email Address
                </h2>
                <p className="text-sm text-muted-foreground">
                  We've sent a confirmation email to your inbox. Please click the link in the email to verify your account and complete the signup process.
                </p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-5 text-sm text-muted-foreground">
                <p>
                  <strong>Didn't receive the email?</strong>
                </p>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• Check your spam or junk folder</li>
                  <li>• Make sure you entered the correct email address</li>
                  <li>• Try signing up again with a valid email</li>
                </ul>
              </div>

              <Button
                onClick={() => navigate("/login")}
                variant="outline"
                className="w-full"
              >
                Back to Login
              </Button>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
