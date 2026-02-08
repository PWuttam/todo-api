// server/middlewares/auth.js
import jwt from 'jsonwebtoken';

export default function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'JWT_SECRET is not configured' });
  }

  try {
    const payload = jwt.verify(token, secret);
    if (payload.tokenType && payload.tokenType !== 'access') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
