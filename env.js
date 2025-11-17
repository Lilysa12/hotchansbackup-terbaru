import dotenv from "dotenv";
dotenv.config();

console.log("ENV LOADED:", {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? "OK" : "MISSING"
});
