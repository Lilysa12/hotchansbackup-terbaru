// /api/sendotp.js
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const FROM_NAME = process.env.FROM_NAME || "No-Reply";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email wajib diisi" });

    // ambil OTP terbaru untuk email
    const { data: otpData, error } = await supabase
      .from("otp")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !otpData) {
      return res.status(404).json({ message: "OTP tidak ditemukan. Silakan minta OTP baru." });
    }

    // cek expired
    const now = new Date();
    const expired = new Date(otpData.expired_at);
    if (now > expired) {
      return res.status(400).json({ message: "Kode OTP sudah kadaluarsa. Silakan minta OTP baru." });
    }

    // kirim ulang kode yang sama
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${EMAIL_USER}>`,
      to: email,
      subject: "Kirim Ulang Kode Verifikasi OTP Anda",
      html: `
        <h2>Kode Verifikasi Anda</h2>
        <p>Gunakan kode berikut untuk verifikasi:</p>
        <h1 style="font-size: 35px; letter-spacing: 5px;">${otpData.otp_code}</h1>
        <p>Kode ini berlaku sampai ${expired.toLocaleString()}.</p>
      `,
    });

    return res.status(200).json({ message: "OTP berhasil dikirim ulang" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", detail: err.message });
  }
}
