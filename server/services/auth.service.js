// server/services/auth.service.js
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import RefreshToken from '../models/refreshToken.js';

const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const getAccessSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
};

const getRefreshSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not configured');
  }
  return secret;
};

export const createAccessToken = (payload) =>
  jwt.sign({ ...payload, tokenType: 'access' }, getAccessSecret(), {
    expiresIn: ACCESS_EXPIRES_IN,
  });

export const createRefreshToken = (payload) =>
  jwt.sign({ ...payload, tokenType: 'refresh' }, getRefreshSecret(), {
    expiresIn: REFRESH_EXPIRES_IN,
  });

export const verifyRefreshToken = (token) => jwt.verify(token, getRefreshSecret());

export const hashRefreshToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const createInvalidRefreshTokenError = () => {
  const error = new Error('Invalid refresh token');
  error.name = 'InvalidRefreshTokenError';
  return error;
};

const getRefreshTokenExpiry = (token) => {
  const decoded = jwt.decode(token);
  if (!decoded || !decoded.exp) {
    throw createInvalidRefreshTokenError();
  }
  return new Date(decoded.exp * 1000);
};

const getUserIdFromPayload = (payload) => {
  if (payload?.id) {
    return payload.id;
  }
  if (payload?.userId) {
    return payload.userId;
  }
  if (payload?.sub) {
    return payload.sub;
  }
  throw new Error('Refresh token payload is missing user id');
};

const stripTokenClaims = (payload) => {
  const { tokenType, iat, exp, nbf, iss, aud, sub, jti, ...userPayload } = payload;
  return userPayload;
};

export const issueRefreshToken = async (payload) => {
  const refreshToken = createRefreshToken(payload);
  const tokenHash = hashRefreshToken(refreshToken);
  const expiresAt = getRefreshTokenExpiry(refreshToken);
  const userId = getUserIdFromPayload(payload);

  const tokenRecord = await RefreshToken.create({
    userId,
    tokenHash,
    expiresAt,
  });

  return { refreshToken, tokenRecord };
};

export const rotateRefreshToken = async (refreshToken) => {
  const payload = verifyRefreshToken(refreshToken);
  const tokenHash = hashRefreshToken(refreshToken);
  const existing = await RefreshToken.findOne({ tokenHash });

  if (!existing || existing.revokedAt) {
    throw createInvalidRefreshTokenError();
  }

  existing.revokedAt = new Date();
  await existing.save();

  const userPayload = stripTokenClaims(payload);
  const { refreshToken: nextRefreshToken } = await issueRefreshToken(userPayload);

  return { payload, refreshToken: nextRefreshToken };
};

export const revokeRefreshToken = async (refreshToken) => {
  const payload = verifyRefreshToken(refreshToken);
  const tokenHash = hashRefreshToken(refreshToken);
  const userId = getUserIdFromPayload(payload);

  const result = await RefreshToken.updateOne(
    { tokenHash, userId, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );

  return result.modifiedCount > 0;
};
