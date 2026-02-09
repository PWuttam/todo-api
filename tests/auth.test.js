import { describe, test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import request from 'supertest';

let app;
let connectDB;
let createApp;
let RefreshToken;
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
});

describe('Auth refresh rotation and logout', () => {
  test('rotates refresh token and invalidates the old one', async () => {
    const { refreshToken } = await issueRefreshToken({ id: 'user-1', email: 'a@example.com' });

    const first = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    assert.ok(first.body.accessToken);
    assert.ok(first.body.refreshToken);
    assert.notEqual(first.body.refreshToken, refreshToken);

    await request(app).post('/auth/refresh').send({ refreshToken }).expect(401);
  });

  test('logout revokes the refresh token', async () => {
    const { refreshToken } = await issueRefreshToken({ id: 'user-2', email: 'b@example.com' });

    await request(app).post('/auth/logout').send({ refreshToken }).expect(204);

    await request(app).post('/auth/refresh').send({ refreshToken }).expect(401);
  });
});
