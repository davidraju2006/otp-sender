// src/utils/rc4.js
/**
 * RC4 Stream Cipher (educational only, insecure in real-world use)
 * @param {string} key - secret key
 * @param {string} data - plaintext (for encrypt) or ciphertext (for decrypt)
 * @returns {string} encrypted/decrypted result
 */
function rc4(key, data) {
  const s = [];
  const k = [];
  let i, j = 0, tmp;


  for (i = 0; i < 256; i++) {
    s[i] = i;
    k[i] = key.charCodeAt(i % key.length);
  }


  for (i = 0; i < 256; i++) {
    j = (j + s[i] + k[i]) % 256;
    tmp = s[i];
    s[i] = s[j];
    s[j] = tmp;
  }

  i = j = 0;
  let result = "";
  for (let c = 0; c < data.length; c++) {
    i = (i + 1) % 256;
    j = (j + s[i]) % 256;
    tmp = s[i];
    s[i] = s[j];
    s[j] = tmp;

    const t = (s[i] + s[j]) % 256;
    const kByte = s[t];
    result += String.fromCharCode(data.charCodeAt(c) ^ kByte);
  }

  return result;
}

module.exports = { rc4 };
