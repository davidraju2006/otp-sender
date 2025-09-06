
const store = new Map();


function setOtp(key, value) {
  store.set(key, value);
}
function getOtp(key) {
  return store.get(key);
}
function delOtp(key) {
  store.delete(key);
}
module.exports = { setOtp, getOtp, delOtp };
