const crypto = require('crypto');

// Generate a random short code
exports.generateShortCode = (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomBytes = crypto.randomBytes(length);
  
  let result = 'DP';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(randomBytes[i] % characters.length);
  }
  
  return result;
};
