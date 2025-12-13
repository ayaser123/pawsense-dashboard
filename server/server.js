import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(
  cors({
    origin: ["http://localhost:8080", process.env.FRONTEND_URL].filter(Boolean),
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", environment: process.env.NODE_ENV || "development" });
});

// Root route for quick browser checks
app.get("/", (_req, res) => {
  res.status(200).json({ message: "Pawsense backend running", health: "/health", auth: "/auth/create-user" });
});

// --- Auth endpoints (minimal stubs to support frontend/tests) ---
app.post("/auth/create-user", (req, res) => {
  try {
    const { email, password, metadata } = req.body || {};

    // very basic validation
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(422).json({ error: "Invalid email", details: "Email is required and must be valid" });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(422).json({ error: "Invalid password", details: "Password must be at least 6 characters" });
    }

    const userId = randomUUID();
    console.log("[AUTH] Create user:", { email, userId, metadata });

    return res.status(201).json({ success: true, userId, email });
  } catch (err) {
    console.error("[AUTH] create-user error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/auth/dev-confirm-email", (req, res) => {
  const { email } = req.body || {};
  console.log("[AUTH] Dev confirm email:", email);
  return res.status(200).json({ success: true, email });
});

app.post("/auth/user-sync", (req, res) => {
  const { userId, email, metadata } = req.body || {};
  console.log("[AUTH] User sync:", { userId, email, metadata });
  return res.status(200).json({ success: true });
});

app.post("/auth/update-profile", (req, res) => {
  const { userId, email, metadata } = req.body || {};
  console.log("[AUTH] Update profile:", { userId, email, metadata });
  return res.status(200).json({ success: true });
});

app.post("/auth/logout", (req, res) => {
  const { email } = req.body || {};
  console.log("[AUTH] Logout:", { email });
  return res.status(200).json({ success: true });
});

// Fallback
app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.path });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend API running on http://localhost:${PORT}`);
});
