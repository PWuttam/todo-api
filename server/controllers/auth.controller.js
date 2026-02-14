// server/controllers/auth.controller.js
import { body, validationResult } from 'express-validator';
import {
  createAccessToken,
  rotateRefreshToken,
  revokeRefreshToken,
} from '../services/auth.service.js';

const TOKEN_TYPE = 'Bearer';

export const validateRefresh = [
  body('refreshToken').isString().trim().notEmpty().withMessage('refreshToken is required'),
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
    const { payload, refreshToken: nextRefreshToken } = await rotateRefreshToken(refreshToken);

    if (payload.tokenType && payload.tokenType !== 'refresh') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { tokenType, iat, exp, nbf, iss, aud, sub, jti, ...userPayload } = payload;

    const accessToken = createAccessToken(userPayload);
    return res.json({
      accessToken,
      refreshToken: nextRefreshToken,
      tokenType: TOKEN_TYPE,
    });
  } catch (e) {
    if (
      e.name === 'TokenExpiredError' ||
      e.name === 'JsonWebTokenError' ||
      e.name === 'InvalidRefreshTokenError'
    ) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return next(e);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const revoked = await revokeRefreshToken(refreshToken);

    if (!revoked) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    return res.status(204).send();
  } catch (e) {
    if (
      e.name === 'TokenExpiredError' ||
      e.name === 'JsonWebTokenError' ||
      e.name === 'InvalidRefreshTokenError'
    ) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return next(e);
  }
};
