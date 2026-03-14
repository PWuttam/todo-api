// server/services/auth.service.js
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import RefreshToken from '../models/refreshToken.js';
import SecurityEvent from '../models/securityEvent.js';

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

export const createRefreshToken = (payload, options = {}) =>
  jwt.sign({ ...payload, tokenType: 'refresh' }, getRefreshSecret(), {
    expiresIn: REFRESH_EXPIRES_IN,
    jwtid: options.jti,
  });

export const verifyRefreshToken = (token) => jwt.verify(token, getRefreshSecret());

export const hashRefreshToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const createInvalidRefreshTokenError = () => {
  const error = new Error('Invalid refresh token');
  error.name = 'InvalidRefreshTokenError';
  error.status = 401;
  error.code = 'INVALID_TOKEN';
  return error;
};

const createRefreshTokenReuseError = () => {
  const error = new Error('Refresh token reuse detected');
  error.name = 'RefreshTokenReuseDetectedError';
  error.code = 'REFRESH_TOKEN_REUSE';
  error.errorCode = 'REFRESH_TOKEN_REUSE';
  error.status = 403;
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

const generateId = () => crypto.randomUUID();

const createTokenMetadata = (options = {}) => ({
  jti: options.jti || generateId(),
  familyId: options.familyId || generateId(),
  parentJti: options.parentJti || null,
});

const isActiveTokenRecord = (tokenRecord) =>
  tokenRecord &&
  (tokenRecord.status === 'active' || (!tokenRecord.status && !tokenRecord.revokedAt));

const isRotatedOrRevokedTokenRecord = (tokenRecord) =>
  tokenRecord &&
  (tokenRecord.status === 'rotated' || tokenRecord.status === 'revoked' || !!tokenRecord.revokedAt);

const revokeAllRefreshTokensForUser = async (userId, reason, now = new Date()) => {
  await RefreshToken.updateMany(
    {
      userId,
      $or: [{ status: 'active' }, { status: { $exists: false }, revokedAt: null }],
    },
    {
      $set: {
        status: 'revoked',
        revokedReason: reason,
        revokedAt: now,
      },
    }
  );
};

const recordRefreshTokenReuseEvent = async ({ userId, jti, familyId, ip, userAgent, tokenId }) => {
  await SecurityEvent.create({
    eventType: 'refresh_token_reuse_detected',
    userId,
    jti: jti || null,
    familyId: familyId || null,
    ip: ip || null,
    userAgent: userAgent || null,
    occurredAt: new Date(),
    metadata: tokenId ? { tokenId: String(tokenId) } : null,
  });
};

const handleRefreshTokenReuse = async ({ tokenRecord, requestContext = {} }) => {
  const now = new Date();
  await recordRefreshTokenReuseEvent({
    userId: tokenRecord.userId,
    jti: tokenRecord.jti,
    familyId: tokenRecord.familyId,
    ip: requestContext.ip,
    userAgent: requestContext.userAgent,
    tokenId: tokenRecord._id,
  });
  await revokeAllRefreshTokensForUser(tokenRecord.userId, 'reuse_detected', now);
  throw createRefreshTokenReuseError();
};

export const issueRefreshToken = async (payload, options = {}) => {
  const tokenMetadata = createTokenMetadata(options);
  const refreshToken = createRefreshToken(payload, { jti: tokenMetadata.jti });
  const tokenHash = hashRefreshToken(refreshToken);
  const expiresAt = getRefreshTokenExpiry(refreshToken);
  const userId = getUserIdFromPayload(payload);

  const tokenRecord = await RefreshToken.create({
    userId,
    jti: tokenMetadata.jti,
    familyId: tokenMetadata.familyId,
    parentJti: tokenMetadata.parentJti,
    replacedByJti: null,
    tokenHash,
    status: 'active',
    revokedReason: null,
    usedAt: null,
    revokedAt: null,
    expiresAt,
  });

  return { refreshToken, tokenRecord };
};

export const rotateRefreshToken = async (refreshToken, requestContext = {}) => {
  const payload = verifyRefreshToken(refreshToken);
  const tokenJti = payload?.jti;
  if (!tokenJti) {
    throw createInvalidRefreshTokenError();
  }

  const tokenHash = hashRefreshToken(refreshToken);
  const existing = await RefreshToken.findOne({ jti: tokenJti });

  if (!existing) {
    throw createInvalidRefreshTokenError();
  }

  if (existing.tokenHash !== tokenHash) {
    throw createInvalidRefreshTokenError();
  }

  if (isRotatedOrRevokedTokenRecord(existing) && !isActiveTokenRecord(existing)) {
    await handleRefreshTokenReuse({ tokenRecord: existing, requestContext });
  }

  if (!isActiveTokenRecord(existing)) {
    throw createInvalidRefreshTokenError();
  }

  const userId = getUserIdFromPayload(payload);
  const nextJti = generateId();
  const now = new Date();

  const rotateResult = await RefreshToken.updateOne(
    {
      _id: existing._id,
      userId,
      revokedAt: null,
      $or: [{ status: 'active' }, { status: { $exists: false } }],
    },
    {
      $set: {
        status: 'rotated',
        revokedReason: 'rotated',
        revokedAt: now,
        usedAt: now,
        replacedByJti: nextJti,
      },
    }
  );

  if (rotateResult.modifiedCount === 0) {
    const reloaded = await RefreshToken.findById(existing._id);
    if (reloaded && isRotatedOrRevokedTokenRecord(reloaded)) {
      await handleRefreshTokenReuse({ tokenRecord: reloaded, requestContext });
    }
    throw createInvalidRefreshTokenError();
  }

  const userPayload = stripTokenClaims(payload);
  const { refreshToken: nextRefreshToken } = await issueRefreshToken(userPayload, {
    jti: nextJti,
    familyId: existing.familyId || generateId(),
    parentJti: existing.jti || payload.jti || null,
  });

  return { payload, refreshToken: nextRefreshToken };
};

export const revokeRefreshToken = async (refreshToken) => {
  const payload = verifyRefreshToken(refreshToken);
  const tokenHash = hashRefreshToken(refreshToken);
  const userId = getUserIdFromPayload(payload);

  const now = new Date();
  const result = await RefreshToken.updateOne(
    {
      tokenHash,
      userId,
      revokedAt: null,
      $or: [{ status: 'active' }, { status: { $exists: false } }],
    },
    {
      $set: {
        status: 'revoked',
        revokedReason: 'logout',
        revokedAt: now,
      },
    }
  );

  return result.modifiedCount > 0;
};
