import { describe, test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';

let app;
let connectDB;
let createApp;
let RefreshToken;
let SecurityEvent;
let issueRefreshToken;

before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.MONGO_URI =
    process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/todo_api_test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';

  ({ connectDB } = await import('../server/config/db.js'));
  ({ createApp } = await import('../server/app.js'));
  ({ default: RefreshToken } = await import('../server/models/refreshToken.js'));
  ({ default: SecurityEvent } = await import('../server/models/securityEvent.js'));
  ({ issueRefreshToken } = await import('../server/services/auth.service.js'));

  await connectDB();
  app = createApp();
});

after(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
});

beforeEach(async () => {
  await RefreshToken.deleteMany({});
  await SecurityEvent.deleteMany({});
});

describe('Auth refresh rotation and logout', () => {
  test('rotates refresh token and treats old token replay as reuse', async () => {
    const { refreshToken } = await issueRefreshToken({ id: 'user-1', email: 'a@example.com' });

    const first = await request(app).post('/auth/refresh').send({ refreshToken }).expect(200);

    assert.ok(first.body.accessToken);
    assert.ok(first.body.refreshToken);
    assert.ok(first.body.tokenType);
    assert.equal(first.body.tokenType, 'Bearer');
    assert.notEqual(first.body.refreshToken, refreshToken);

    const oldToken = await RefreshToken.findOne({ tokenHash: { $exists: true } })
      .sort({ createdAt: 1 })
      .lean();
    const newToken = await RefreshToken.findOne({ tokenHash: { $exists: true } })
      .sort({ createdAt: -1 })
      .lean();

    assert.equal(oldToken.status, 'rotated');
    assert.equal(oldToken.revokedReason, 'rotated');
    assert.ok(oldToken.usedAt);
    assert.equal(oldToken.replacedByJti, newToken.jti);
    assert.equal(newToken.status, 'active');
    assert.equal(newToken.parentJti, oldToken.jti);
    assert.equal(newToken.familyId, oldToken.familyId);

    const reuse = await request(app).post('/auth/refresh').send({ refreshToken }).expect(403);
    assert.equal(reuse.body.code, 'REFRESH_TOKEN_REUSE');
  });

  test('logout revokes the refresh token', async () => {
    const { refreshToken } = await issueRefreshToken({ id: 'user-2', email: 'b@example.com' });

    await request(app).post('/auth/logout').send({ refreshToken }).expect(204);

    const reuse = await request(app).post('/auth/refresh').send({ refreshToken }).expect(403);
    assert.equal(reuse.body.code, 'REFRESH_TOKEN_REUSE');
  });

  test('reusing a rotated refresh token revokes all user tokens and records security event', async () => {
    const { refreshToken: firstToken } = await issueRefreshToken({
      id: 'user-3',
      email: 'c@example.com',
    });
    const { refreshToken: parallelSessionToken } = await issueRefreshToken({
      id: 'user-3',
      email: 'c@example.com',
    });

    const rotated = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken: firstToken })
      .expect(200);
    assert.ok(rotated.body.refreshToken);

    const reuse = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken: firstToken })
      .expect(403);
    assert.equal(reuse.body.code, 'REFRESH_TOKEN_REUSE');
    const decoded = jwt.decode(firstToken);

    const tokens = await RefreshToken.find({ userId: 'user-3' }).lean();
    assert.ok(tokens.length >= 3);
    assert.ok(tokens.every((token) => token.status !== 'active'));
    assert.ok(tokens.some((token) => token.revokedReason === 'reuse_detected'));
    const firstTokenRecord = tokens.find((token) => token.jti === decoded.jti);
    assert.equal(firstTokenRecord.revokedReason, 'rotated');

    const events = await SecurityEvent.find({
      userId: 'user-3',
      eventType: 'refresh_token_reuse_detected',
    }).lean();
    assert.equal(events.length, 1);
    assert.equal(events[0].jti, decoded.jti);

    await request(app)
      .post('/auth/refresh')
      .send({ refreshToken: parallelSessionToken })
      .expect(403);
    await request(app)
      .post('/auth/refresh')
      .send({ refreshToken: rotated.body.refreshToken })
      .expect(403);
  });

  test('reusing a revoked(refresh-logout) token is treated as token reuse', async () => {
    const { refreshToken } = await issueRefreshToken({ id: 'user-4', email: 'd@example.com' });
    await issueRefreshToken({ id: 'user-4', email: 'd+2@example.com' });

    await request(app).post('/auth/logout').send({ refreshToken }).expect(204);

    const reuse = await request(app).post('/auth/refresh').send({ refreshToken }).expect(403);
    assert.equal(reuse.body.code, 'REFRESH_TOKEN_REUSE');

    const tokens = await RefreshToken.find({ userId: 'user-4' }).lean();
    assert.ok(tokens.length >= 2);
    assert.ok(tokens.every((token) => token.status !== 'active'));
    const decoded = jwt.decode(refreshToken);
    const logoutToken = tokens.find((token) => token.jti === decoded.jti);
    assert.equal(logoutToken.revokedReason, 'logout');
    assert.ok(tokens.some((token) => token.revokedReason === 'reuse_detected'));

    const event = await SecurityEvent.findOne({
      userId: 'user-4',
      eventType: 'refresh_token_reuse_detected',
    }).lean();
    assert.ok(event);

    const followupTokenReuse = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(403);
    assert.equal(followupTokenReuse.body.code, 'REFRESH_TOKEN_REUSE');
  });
});
