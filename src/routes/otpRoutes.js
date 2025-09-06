// src/routes/otpRoutes.js
const express = require("express");
const { generateOtp, hashOtp, verifyOtp, newUserPepper } = require("../otp/otp");
const { sendEmailOtp, sendSmsOtp } = require("../senders/senders");
const { setOtp, getOtp, delOtp } = require("../store/otpStore");

const router = express.Router();

const OTP_TTL_MS = 5 * 60_000; // 5 minutes
const MAX_ATTEMPTS = 5;

// ✅ Send OTP
router.post("/send", async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ error: "email or phone is required" });
    }

    const destination = email || phone;

    // Generate OTP
    const otp = generateOtp(6);
    const pepper = newUserPepper();
    const hashed = hashOtp(otp, pepper);
    const expiresAt = Date.now() + OTP_TTL_MS;

    setOtp(destination, { hash: hashed, pepper, expiresAt, attempts: 0 });

    if (email) {
      await sendEmailOtp(email, otp);
    }
    if (phone) {
      await sendSmsOtp(phone, otp);
    }

    return res.json({ ok: true, channel: email ? "email" : "sms" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    return res.status(500).json({ error: "failed_to_send_otp" });
  }
});

// ✅ Verify OTP
router.post("/verify", (req, res) => {
  const { email, phone, otp } = req.body;

  const destination = email || phone;
  if (!destination || !otp) {
    return res.status(400).json({ error: "destination and otp are required" });
  }

  const record = getOtp(destination);
  if (!record) {
    return res.status(400).json({ error: "no_otp_or_expired" });
  }

  if (Date.now() > record.expiresAt) {
    delOtp(destination);
    return res.status(400).json({ error: "expired" });
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    delOtp(destination);
    return res.status(429).json({ error: "too_many_attempts" });
  }

  record.attempts++;

  const ok = verifyOtp(otp, record.hash, record.pepper);
  if (!ok) {
    setOtp(destination, record); // update attempts
    return res.status(401).json({ ok: false, error: "invalid_otp" });
  }

  delOtp(destination);
  return res.json({ ok: true });
});

module.exports = router;
