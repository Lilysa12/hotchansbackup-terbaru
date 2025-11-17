// index.js
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();


import lupapwHandler from "./api/lupapw.js";
import sendotpHandler from "./api/sendotp.js";
import verifotpHandler from "./api/verifotp.js";

const app = express();

// Security middleware
app.use(helmet());

// CORS FIX — WAJIB untuk frontend bisa panggil backend
app.use(cors());

// Parse JSON
app.use(bodyParser.json());

// Rate limiter
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  max: Number(process.env.RATE_LIMIT_MAX || 100),
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// API Routes
app.post("/api/lupapw", lupapwHandler);
app.post("/api/sendotp", sendotpHandler);
app.post("/api/verifotp", verifotpHandler);

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}/hotchansmotor/`)
);
