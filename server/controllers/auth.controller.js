// server/controllers/auth.controller.js
import { body, validationResult } from 'express-validator';
import { createAccessToken, verifyRefreshToken } from '../services/auth.service.js';

export const validateRefresh = [
  body('refreshToken')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('refreshToken is required'),
];

export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation error',
      details: errors.array(),
    });
  }
  return next();
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const payload = verifyRefreshToken(refreshToken);

    if (payload.tokenType && payload.tokenType !== 'refresh') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const {
      tokenType,
      iat,
      exp,
      nbf,
      iss,
      aud,
      sub,
      jti,
      ...userPayload
    } = payload;

    const accessToken = createAccessToken(userPayload);
    return res.json({ accessToken, tokenType: 'Bearer' });
  } catch (e) {
    if (e.name === 'TokenExpiredError' || e.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return next(e);
  }
};
