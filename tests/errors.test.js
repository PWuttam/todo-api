import jwt from 'jsonwebtoken';
import request from 'supertest';

let app;
let authHeader;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

  const { createApp } = await import('../server/app.js');
  app = createApp();

  const token = jwt.sign(
    { id: 'errors-user-id', email: 'errors@example.com', tokenType: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  authHeader = `Bearer ${token}`;
});

describe('Error responses', () => {
  test('returns VALIDATION_ERROR for POST /todos without title', async () => {
    const res = await request(app)
      .post('/todos')
      .set('Authorization', authHeader)
      .send({ status: 'pending' })
      .expect(400);

    expect(res.body).toEqual({
      error: 'Validation error',
      code: 'VALIDATION_ERROR',
      details: [{ field: 'title', msg: 'title is required' }],
    });
  });

  test('returns NOT_FOUND for an undefined route', async () => {
    const res = await request(app).get('/does-not-exist').expect(404);

    expect(res.body).toEqual({
      error: 'Not found',
      code: 'NOT_FOUND',
    });
  });

  test('returns INTERNAL_ERROR for unexpected errors', async () => {
    const res = await request(app).get('/error-test').expect(500);

    expect(res.body).toEqual({
      error: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
    });
  });
});
