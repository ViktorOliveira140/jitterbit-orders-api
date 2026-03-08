const jwt = require('jsonwebtoken');

const { HttpError } = require('../errors/HttpError');

function issueToken(username, password) {
  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASS;
  const jwtSecret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '1h';

  if (!adminUser || !adminPass) {
    throw new HttpError(500, 'Admin credentials are not configured');
  }

  if (!jwtSecret) {
    throw new HttpError(500, 'JWT_SECRET is not configured');
  }

  if (username !== adminUser || password !== adminPass) {
    throw new HttpError(401, 'Invalid credentials');
  }

  return jwt.sign({ sub: username }, jwtSecret, { expiresIn });
}

module.exports = { issueToken };

