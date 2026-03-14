// server/middlewares/auth.js
import jwt from 'jsonwebtoken';
import { createHttpError } from '../utils/http-errors.js';

export default function auth(req, _res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(createHttpError(401, 'Unauthorized', 'UNAUTHORIZED'));
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(createHttpError(500, 'JWT_SECRET is not configured', 'INTERNAL_ERROR'));
  }

  try {
    const payload = jwt.verify(token, secret);
    if (payload.tokenType && payload.tokenType !== 'access') {
      return next(createHttpError(401, 'Invalid token', 'INVALID_TOKEN'));
    }
    req.user = payload;
    return next();
  } catch (_err) {
    return next(createHttpError(401, 'Invalid token', 'INVALID_TOKEN'));
  }
}
