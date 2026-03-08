const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  // Middleware simples para autenticação via Bearer token (JWT).
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: { message: 'Missing Authorization header' } });
  }

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: { message: 'Invalid Authorization header' } });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: { message: 'JWT_SECRET is not configured' } });
  }

  try {
    req.user = jwt.verify(token, secret);
    return next();
  } catch {
    return res.status(401).json({ error: { message: 'Invalid token' } });
  }
}

module.exports = { authMiddleware };
