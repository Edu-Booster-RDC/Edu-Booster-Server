function generateExpiration(expiresInMinutes = 10) {
  return new Date(Date.now() + expiresInMinutes * 60 * 1000);
}

module.exports = generateExpiration;
