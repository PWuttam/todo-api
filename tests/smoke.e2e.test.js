import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import request from 'supertest';

let app;
let Todo;
let connectDB;
let authHeader;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI =
    process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/todo_api_test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

  ({ connectDB } = await import('../server/config/db.js'));
  const { createApp } = await import('../server/app.js');
  ({ default: Todo } = await import('../server/models/todo.js'));

  await connectDB();
  app = createApp();

  const token = jwt.sign(
    { id: 'e2e-user-id', email: 'e2e@example.com', tokenType: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  authHeader = `Bearer ${token}`;
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
});

beforeEach(async () => {
  await Todo.deleteMany({});
});

describe('Smoke E2E', () => {
  test('create -> list -> update -> delete', async () => {
    const created = await request(app)
      .post('/todos')
      .set('Authorization', authHeader)
      .send({ title: 'Smoke item', status: 'pending' })
      .expect(201);

    const listAfterCreate = await request(app)
      .get('/todos')
      .set('Authorization', authHeader)
      .expect(200);
    expect(listAfterCreate.body.total).toBe(1);

    const updated = await request(app)
      .put(`/todos/${created.body._id}`)
      .set('Authorization', authHeader)
      .send({ status: 'completed' })
      .expect(200);
    expect(updated.body.status).toBe('completed');

    await request(app)
      .delete(`/todos/${created.body._id}`)
      .set('Authorization', authHeader)
      .expect(204);

    const listAfterDelete = await request(app)
      .get('/todos')
      .set('Authorization', authHeader)
      .expect(200);
    expect(listAfterDelete.body.total).toBe(0);
  });
});
