// senders.js
require("dotenv").config();
const nodemailer = require("nodemailer");
const twilio = require("twilio");

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmailOtp(toEmail, otp) {
  const info = await mailer.sendMail({
    from: `"Security" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Your One-Time Password (OTP)",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    html: `<p>Your OTP is <b>${otp}</b>. It expires in <b>5 minutes</b>.</p>`,
  });
  return info.messageId;
}

const { sendFast2Sms } = require("../config/sms");

async function sendSmsOtp(toPhoneE164, otp) {
  const message = `Your OTP is ${otp}. It expires in 5 minutes.`;
  const result = await sendFast2Sms(toPhoneE164, message);
  return result.request_id;
}

module.exports = { sendEmailOtp, sendSmsOtp };
