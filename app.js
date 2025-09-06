// app.js
require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const { generateOtp, hashOtp, verifyOtp, newUserPepper } = require("./src/otp/otp");
const { sendEmailOtp, sendSmsOtp } = require("./src/senders/senders");
const { setOtp, getOtp, delOtp } = require("./src/store/otpStore");
const { admin } = require("./src/config/firebase-config");

const app = express();
app.use(express.json());

// Basic rate limit to prevent abuse
const limiter = rateLimit({ windowMs: 60_000, max: 10 });
app.use("/otp", limiter);

// Choose how you key OTPs. For demo, we key by "destination".
const OTP_TTL_MS = 5 * 60_000; // 5 minutes
const MAX_ATTEMPTS = 5;

// Request an OTP
app.post("/otp/send", async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email && !phone) {
      return res.status(400).json({ error: "email or phone required" });
    }
    const destination = email || phone;

    // Generate & store hash
    const otp = generateOtp(6);
    // Per-user pepper (create or reuse). In demo we make a fresh one each send.
    const pepper = newUserPepper();
    const hashed = hashOtp(otp, pepper);
    const expiresAt = Date.now() + OTP_TTL_MS;

    setOtp(destination, { hash: hashed, pepper, expiresAt, attempts: 0 });

    // Send via the chosen channel
    if (email) await sendEmailOtp(email, otp);
    if (phone) await sendSmsOtp(phone, otp);

    return res.json({ ok: true, channel: email ? "email" : "sms" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "failed_to_send_otp" });
  }
});

// Verify an OTP
app.post("/otp/verify", async (req, res) => {
  const { email, phone, otp, idToken } = req.body;
  const destination = email || phone;
  if (!destination) {
    return res.status(400).json({ error: "destination required" });
  }

  if (phone && idToken) {
    // Firebase phone verification
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      if (decodedToken.phone_number === phone) {
        return res.json({ ok: true });
      } else {
        return res.status(401).json({ ok: false, error: "phone number mismatch" });
      }
    } catch (error) {
      return res.status(401).json({ ok: false, error: "invalid token" });
    }
  } else if (email && otp) {
    // Custom OTP for email
    const record = getOtp(destination);
    if (!record) return res.status(400).json({ error: "no_otp_or_expired" });

    if (Date.now() > record.expiresAt) {
      delOtp(destination);
      return res.status(400).json({ error: "expired" });
    }

    // Attempt throttling
    if (record.attempts >= MAX_ATTEMPTS) {
      delOtp(destination);
      return res.status(429).json({ error: "too_many_attempts" });
    }
    record.attempts++;

    const ok = verifyOtp(otp, record.hash, record.pepper);
    if (!ok) {
      setOtp(destination, record); // update attempts
      return res.status(401).json({ ok: false });
    }

    // Success — one-time use
    delOtp(destination);
    return res.json({ ok: true });
  } else {
    return res.status(400).json({ error: "invalid request" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`OTP server on http://localhost:${PORT}`));
