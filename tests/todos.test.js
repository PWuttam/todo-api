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
    { id: 'test-user-id', email: 'test@example.com', tokenType: 'access' },
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

describe('Todos API', () => {
  test('creates a todo (happy path)', async () => {
    const res = await request(app)
      .post('/todos')
      .set('Authorization', authHeader)
      .send({ title: 'Test todo', status: 'pending' })
      .expect(201);

    expect(res.body.title).toBe('Test todo');
    expect(res.body.status).toBe('pending');
  });

  test('lists todos including the created one (happy path)', async () => {
    await request(app)
      .post('/todos')
      .set('Authorization', authHeader)
      .send({ title: 'List me' })
      .expect(201);

    const res = await request(app).get('/todos').set('Authorization', authHeader).expect(200);

    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.total).toBe(1);
    expect(res.body.items[0].title).toBe('List me');
  });

  test('updates a todo status (happy path)', async () => {
    const created = await request(app)
      .post('/todos')
      .set('Authorization', authHeader)
      .send({ title: 'Update me', status: 'pending' })
      .expect(201);

    const updated = await request(app)
      .put(`/todos/${created.body._id}`)
      .set('Authorization', authHeader)
      .send({ status: 'completed' })
      .expect(200);

    expect(updated.body.status).toBe('completed');
  });

  test('deletes a todo (happy path)', async () => {
    const created = await request(app)
      .post('/todos')
      .set('Authorization', authHeader)
      .send({ title: 'Delete me' })
      .expect(201);

    await request(app)
      .delete(`/todos/${created.body._id}`)
      .set('Authorization', authHeader)
      .expect(204);

    const res = await request(app).get('/todos').set('Authorization', authHeader).expect(200);
    expect(res.body.total).toBe(0);
  });

  test('returns validation error when title is missing', async () => {
    const res = await request(app)
      .post('/todos')
      .set('Authorization', authHeader)
      .send({ status: 'pending' })
      .expect(400);

    expect(res.body.error).toBe('Validation error');
    expect(Array.isArray(res.body.details)).toBe(true);
    expect(res.body.details.length).toBeGreaterThan(0);
  });
});
