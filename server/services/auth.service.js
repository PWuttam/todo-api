// server/services/auth.service.js
import jwt from 'jsonwebtoken';

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
