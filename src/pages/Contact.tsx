import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { submitContact } from "@/services/contactService";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Client validations
    if (!name.trim()) return setError("Name is required");
    if (!email.trim()) return setError("Email is required");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setError("Enter a valid email");
    if (!message.trim()) return setError("Message is required");
    if (!terms) return setError("Please accept the terms");

    try {
      setLoading(true);
      console.log("[CONTACT] Submitting contact form...");
      
      await submitContact(name, email, message);
      
      setSuccess("✅ Thank you for your message! We'll get back to you soon.");
      console.log("[CONTACT] Success - clearing form");
      setName("");
      setEmail("");
      setMessage("");
      setTerms(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Submission failed";
      console.error("[CONTACT] Error:", err);
      setError(errorMsg || "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gradient-to-br from-primary/10 to-secondary/10 py-12 px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-lg mx-auto w-full"
        >
          <Card className="p-8 space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Contact Us</h1>
              <p className="text-muted-foreground mt-2">Have a question or suggestion? We'd love to hear from you.</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="ml-2">{error}</span>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="ml-2 text-green-800">{success}</span>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Jane Doe"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border rounded-md p-3 min-h-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Write your message here..."
                  disabled={loading}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="terms"
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  disabled={loading}
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                  I agree to the terms and privacy policy.
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </Card>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
