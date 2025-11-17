import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = await req.body;

    const { email, otp } = body;

    if (!email || !otp)
      return res.status(400).json({ error: "Email dan OTP wajib diisi" });

    // Ambil OTP terbaru
    const { data: otpRow, error: otpError } = await supabase
      .from("otp") // 👈 WAJIB
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError) {
      console.log("DB ERROR:", otpError);
      return res.status(500).json({ error: "Database error" });
    }

    if (!otpRow)
      return res.status(400).json({ error: "OTP tidak ditemukan" });

    // Cek digunakan
    if (otpRow.is_used)
      return res.status(400).json({ error: "Kode OTP sudah digunakan" });

    // Cek salah
    if (otpRow.otp_code !== otp)
      return res.status(400).json({ error: "Kode OTP salah" });

    // /5

    // update
    const { error: updateError } = await supabase
      .from("otp") // 👈 WAJIB
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
      })
      .eq("id_otp", otpRow.id_otp);

    if (updateError) {
      console.log("Update error:", updateError);
      return res.status(500).json({ error: "Gagal update OTP" });
    }

    return res.status(200).json({
      message: "OTP valid. Silakan lanjut ubah password.",
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({
      error: "Server error",
      detail: err.message,
    });
  }
}
