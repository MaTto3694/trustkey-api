const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false
});

// =========================
// Basic API
// =========================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Trust Key API is running",
    service: "trustkey-api"
  });
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      success: true,
      database: "connected",
      status: "healthy"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      database: "disconnected",
      status: "unhealthy"
    });
  }
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Trust Key API test endpoint is working"
  });
});

// =========================
// Meta / Facebook Webhook
// =========================

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const verifyToken = process.env.META_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    console.log("META WEBHOOK VERIFIED");
    return res.status(200).send(challenge);
  }

  console.log("META WEBHOOK VERIFICATION FAILED");
  return res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  try {
    console.log("META WEBHOOK EVENT:");
    console.log(JSON.stringify(req.body, null, 2));

    return res.status(200).json({
      success: true,
      received: true
    });
  } catch (error) {
    console.error("Webhook error:", error);

    return res.status(500).json({
      success: false
    });
  }
});

// =========================
// Start Server
// =========================

app.listen(port, "0.0.0.0", () => {
  console.log(`Trust Key API running on port ${port}`);
});
