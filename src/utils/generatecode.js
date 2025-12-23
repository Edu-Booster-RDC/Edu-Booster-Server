const crypto = require("crypto");

function generateCode() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const hash = crypto.createHash("sha256").update(code).digest("hex");

  return { code, hash };
}

function verifyCode(inputCode, storedHash) {
  const inputHash = crypto.createHash("sha256").update(inputCode).digest("hex");
  return inputHash === storedHash;
}

module.exports = { generateCode, verifyCode };
