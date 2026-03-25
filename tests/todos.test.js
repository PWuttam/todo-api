import jwt from 'jsonwebtoken';
import request from 'supertest';

let app;
let Todo;
let connectDB;
let authHeader;
let server;
let mongoose;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI =
    process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/todo_api_test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

  ({ connectDB, mongoose } = await import('../server/config/db.js'));
  const { createApp } = await import('../server/app.js');
  ({ default: Todo } = await import('../server/models/todo.js'));

  await connectDB();
  app = createApp();
  server = app.listen(0);

  const token = jwt.sign(
    { id: 'test-user-id', email: 'test@example.com', tokenType: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  authHeader = `Bearer ${token}`;
});

afterAll(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close(true);
  }
});

beforeEach(async () => {
  await Todo.deleteMany({});
});

describe('Todos API', () => {
  test('creates a todo (happy path)', async () => {
    const res = await request(server)
      .post('/todos')
      .set('Authorization', authHeader)
      .send({ title: 'Test todo', status: 'pending' })
      .expect(201);

    expect(res.body.title).toBe('Test todo');
    expect(res.body.status).toBe('pending');
  });

  test('lists todos including the created one (happy path)', async () => {
    await request(server)
      .post('/todos')
      .set('Authorization', authHeader)
      .send({ title: 'List me' })
      .expect(201);

    const res = await request(server).get('/todos').set('Authorization', authHeader).expect(200);

    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.total).toBe(1);
    expect(res.body.items[0].title).toBe('List me');
  });

  test('updates a todo status (happy path)', async () => {
    const created = await request(server)
      .post('/todos')
      .set('Authorization', authHeader)
      .send({ title: 'Update me', status: 'pending' })
      .expect(201);

    const updated = await request(server)
      .put(`/todos/${created.body._id}`)
      .set('Authorization', authHeader)
      .send({ status: 'completed' })
      .expect(200);

    expect(updated.body.status).toBe('completed');
  });

  test('deletes a todo (happy path)', async () => {
    const created = await request(server)
      .post('/todos')
      .set('Authorization', authHeader)
      .send({ title: 'Delete me' })
      .expect(201);

    await request(server)
      .delete(`/todos/${created.body._id}`)
      .set('Authorization', authHeader)
      .expect(204);

    const res = await request(server).get('/todos').set('Authorization', authHeader).expect(200);
    expect(res.body.total).toBe(0);
  });

  test('returns validation error when title is missing', async () => {
    const res = await request(server)
      .post('/todos')
      .set('Authorization', authHeader)
      .send({ status: 'pending' })
      .expect(400);

    expect(res.body.error).toBe('Validation error');
    expect(res.body.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(res.body.details)).toBe(true);
    expect(res.body.details).toEqual(
      expect.arrayContaining([{ field: 'title', msg: 'title is required' }])
    );
  });
});
