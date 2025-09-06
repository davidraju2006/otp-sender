
const crypto = require("crypto");


function base32ToBuffer(b32) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of b32.replace(/=+$/, "").toUpperCase()) {
    const val = alphabet.indexOf(c);
    if (val < 0) continue;
    bits += val.toString(2).padStart(5, "0");
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}


function hotp(secretB32, counter, digits = 6, algo = "sha1") {
  const key = base32ToBuffer(secretB32);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));

  const hmac = crypto.createHmac(algo, key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;

  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (code % 10 ** digits).toString().padStart(digits, "0");
}

function totp(secretB32, period = 30, digits = 6, algo = "sha1", skew = 1) {
  const t = Math.floor(Date.now() / 1000 / period);

  const candidates = [];
  for (let i = -skew; i <= skew; i++) {
    candidates.push(hotp(secretB32, t + i, digits, algo));
  }

  return {
    now: candidates[skew], 
    candidates,     
  };
}

module.exports = { hotp, totp };
