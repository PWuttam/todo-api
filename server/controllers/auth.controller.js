// server/controllers/auth.controller.js
import { body, validationResult } from 'express-validator';
import {
  createAccessToken,
  rotateRefreshToken,
  revokeRefreshToken,
} from '../services/auth.service.js';
import { createHttpError, createValidationError } from '../utils/http-errors.js';

const TOKEN_TYPE = 'Bearer';

export const validateRefresh = [
  body('refreshToken')
    .exists({ checkFalsy: true })
    .withMessage('refreshToken is required')
    .bail()
    .isString()
    .withMessage('refreshToken must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('refreshToken is required'),
];

export const handleValidation = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createValidationError(errors.array()));
  }
  return next();
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const { payload, refreshToken: nextRefreshToken } = await rotateRefreshToken(refreshToken, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    if (payload.tokenType && payload.tokenType !== 'refresh') {
      return next(createHttpError(401, 'Invalid token', 'INVALID_TOKEN'));
    }

    const { tokenType, iat, exp, nbf, iss, aud, sub, jti, ...userPayload } = payload;

    const accessToken = createAccessToken(userPayload);
    return res.json({
      accessToken,
      refreshToken: nextRefreshToken,
      tokenType: TOKEN_TYPE,
    });
  } catch (e) {
    if (e.name === 'RefreshTokenReuseDetectedError') {
      return next(e);
    }

    if (
      e.name === 'TokenExpiredError' ||
      e.name === 'JsonWebTokenError' ||
      e.name === 'InvalidRefreshTokenError'
    ) {
      return next(createHttpError(401, 'Invalid token', 'INVALID_TOKEN'));
    }
    return next(e);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const revoked = await revokeRefreshToken(refreshToken);

    if (!revoked) {
      return next(createHttpError(401, 'Invalid token', 'INVALID_TOKEN'));
    }

    return res.status(204).send();
  } catch (e) {
    if (
      e.name === 'TokenExpiredError' ||
      e.name === 'JsonWebTokenError' ||
      e.name === 'InvalidRefreshTokenError'
    ) {
      return next(createHttpError(401, 'Invalid token', 'INVALID_TOKEN'));
    }
    return next(e);
  }
};
