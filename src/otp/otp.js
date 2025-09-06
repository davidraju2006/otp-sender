
const crypto = require("crypto");

function generateOtp(digits = 6) {
 
  const max = 10 ** digits;
  const n = crypto.randomInt(0, max);
  return n.toString().padStart(digits, "0");
}


function hashOtp(otp, secretPepper) {

  return crypto
    .pbkdf2Sync(otp + secretPepper, "otp_salt", 100_000, 32, "sha256")
    .toString("hex");
}


function verifyOtp(inputOtp, storedHash, secretPepper) {
  const inputHash = hashOtp(inputOtp, secretPepper);
  const a = Buffer.from(inputHash, "hex");
  const b = Buffer.from(storedHash, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}


function newUserPepper() {
  return crypto.randomBytes(32).toString("hex");
}

module.exports = { generateOtp, hashOtp, verifyOtp, newUserPepper };
