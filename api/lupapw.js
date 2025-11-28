// /api/lupapw.js
import nodemailer from "nodemailer";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// Supabase client (boleh undefined dulu)
let supabase = null;

// Secure OTP generator
function generateOtp() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, "0");
}

export default async function handler(req, res) {

  // CEK ENV DI SINI — BUKAN DI ATAS!
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error("❌ Supabase ENV missing");
    return res.status(500).json({ error: "Server configuration error" });
  }

  // Buat Supabase client bila belum ada
  if (!supabase) {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email wajib diisi" });

    // OTP SETTINGS FROM ENV
    const OTP_TTL_MIN = Number(process.env.OTP_TTL_MIN || 5);
    const MIN_INTERVAL_MS = 60000;

    // Gmail ENV
    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS;
    const FROM_NAME = process.env.FROM_NAME || "No-Reply";

    if (!EMAIL_USER || !EMAIL_PASS) {
      return res.status(500).json({ error: "Email service not configured" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });

    // 1) Check admin
    const { data: admin } = await supabase
      .from("admin")
      .select("id_admin, email")
      .eq("email", email)
      .maybeSingle();

    // 2) Rate limit
    const { data: lastOtp } = await supabase
      .from("otp")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (lastOtp) {
      const lastTime = new Date(lastOtp.created_at).getTime();
      if (Date.now() - lastTime < MIN_INTERVAL_MS) {
        return res.status(429).json({
          error: "Tunggu 1 menit sebelum meminta OTP lagi",
        });
      }
    }

    // 3) Generate OTP
    const otpCode = generateOtp();
    const createdAt = new Date().toISOString();
    const expiredAt = new Date(Date.now() + OTP_TTL_MIN * 60000).toISOString();

    // 4) Save OTP
    await supabase.from("otp").insert({
      email,
      id_admin: admin?.id_admin ?? null,
      otp_code: otpCode,
      created_at: createdAt,
      expired_at: expiredAt,
      is_used: false,
    });



    // 5) Send email
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${EMAIL_USER}>`,
      to: email,
      subject: "Kode Verifikasi OTP Anda",
      html: `
        <h2>Kode Verifikasi Anda</h2>
        <p>Gunakan kode berikut untuk verifikasi:</p>
        <h1 style="font-size: 35px; letter-spacing: 5px;">${otpCode}</h1>
        <p>Kode ini berlaku ${OTP_TTL_MIN} menit.</p>
      `,
    });

    return res.status(200).json({ message: "OTP berhasil dikirim" });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}
// coba-coba comment
