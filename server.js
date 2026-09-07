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
      error: error.message
    });
  }
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Trust Key API test endpoint is working"
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Trust Key API running on port ${port}`);
});
