const jwt = require('jsonwebtoken');

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '15m'
  });
}

function generateRefreshToken(userId) {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d'
  });
}

module.exports = { generateToken, generateRefreshToken };