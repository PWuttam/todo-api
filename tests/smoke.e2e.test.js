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
    { id: 'e2e-user-id', email: 'e2e@example.com', tokenType: 'access' },
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

describe('Smoke E2E', () => {
  test('create -> list -> update -> delete', async () => {
    const created = await request(server)
      .post('/todos')
      .set('Authorization', authHeader)
      .send({ title: 'Smoke item', status: 'pending' })
      .expect(201);

    const listAfterCreate = await request(server)
      .get('/todos')
      .set('Authorization', authHeader)
      .expect(200);
    expect(listAfterCreate.body.total).toBe(1);

    const updated = await request(server)
      .put(`/todos/${created.body._id}`)
      .set('Authorization', authHeader)
      .send({ status: 'completed' })
      .expect(200);
    expect(updated.body.status).toBe('completed');

    await request(server)
      .delete(`/todos/${created.body._id}`)
      .set('Authorization', authHeader)
      .expect(204);

    const listAfterDelete = await request(server)
      .get('/todos')
      .set('Authorization', authHeader)
      .expect(200);
    expect(listAfterDelete.body.total).toBe(0);
  });
});
