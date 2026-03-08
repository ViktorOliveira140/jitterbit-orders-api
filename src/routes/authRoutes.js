const { Router } = require('express');

const { HttpError } = require('../errors/HttpError');
const { issueToken } = require('../auth/authService');

const router = Router();

router.post('/token', (req, res, next) => {
  try {
    const { username, password } = req.body || {};

    if (!username || typeof username !== 'string') {
      throw new HttpError(400, 'username must be a non-empty string');
    }

    if (!password || typeof password !== 'string') {
      throw new HttpError(400, 'password must be a non-empty string');
    }

    const token = issueToken(username, password);
    return res.status(200).json({ token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

