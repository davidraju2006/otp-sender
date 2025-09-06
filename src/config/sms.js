// src/config/sms.js
require("dotenv").config();
const axios = require("axios");

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;

async function sendFast2Sms(toPhoneE164, message) {
  const url = "https://www.fast2sms.com/dev/bulkV2";
  const headers = {
    Authorization: FAST2SMS_API_KEY,
    "Content-Type": "application/json",
  };
  const data = {
    route: "v3",
    sender_id: "TXTIND",
    message: message,
    language: "english",
    flash: 0,
    numbers: toPhoneE164.replace("+", ""), 
  };

  try {
    const response = await axios.post(url, data, { headers });
    return response.data;
  } catch (error) {
    console.error("Fast2SMS error:", error.response?.data || error.message);
    throw error;
  }
}

module.exports = { sendFast2Sms };
