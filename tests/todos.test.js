import { describe, test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import request from 'supertest';

let app;
let connectDB;
let createApp;
let Todo;

before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.MONGO_URI =
    process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/todo_api_test';

  ({ connectDB } = await import('../server/config/db.js'));
  ({ createApp } = await import('../server/app.js'));
  ({ default: Todo } = await import('../server/models/todo.js'));

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
  await Todo.deleteMany({});
});

describe('Todos API', () => {
  test('creates a todo', async () => {
    const res = await request(app)
      .post('/todos')
      .send({ title: 'Test todo', status: 'pending' })
      .expect(201);

    assert.equal(res.body.title, 'Test todo');
    assert.equal(res.body.status, 'pending');
  });

  test('lists todos including the created one', async () => {
    await request(app).post('/todos').send({ title: 'List me' }).expect(201);

    const res = await request(app).get('/todos').expect(200);

    assert.ok(Array.isArray(res.body.items));
    assert.equal(res.body.total, 1);
    assert.equal(res.body.items[0].title, 'List me');
  });

  test('updates a todo status', async () => {
    const created = await request(app)
      .post('/todos')
      .send({ title: 'Update me', status: 'pending' })
      .expect(201);

    const updated = await request(app)
      .put(`/todos/${created.body._id}`)
      .send({ status: 'completed' })
      .expect(200);

    assert.equal(updated.body.status, 'completed');
  });

  test('deletes a todo', async () => {
    const created = await request(app).post('/todos').send({ title: 'Delete me' }).expect(201);

    await request(app).delete(`/todos/${created.body._id}`).expect(204);

    const res = await request(app).get('/todos').expect(200);
    assert.equal(res.body.total, 0);
  });

  test('creates a todo with priority', async () => {
    const res = await request(app)
      .post('/todos')
      .send({ title: 'High priority task', priority: 'high' })
      .expect(201);

    assert.equal(res.body.title, 'High priority task');
    assert.equal(res.body.priority, 'high');
  });

  test('creates a todo with default priority', async () => {
    const res = await request(app).post('/todos').send({ title: 'Default priority' }).expect(201);

    assert.equal(res.body.priority, 'medium');
  });

  test('rejects invalid priority value', async () => {
    const res = await request(app)
      .post('/todos')
      .send({ title: 'Invalid priority', priority: 'urgent' })
      .expect(400);

    assert.ok(res.body.error);
  });

  test('filters todos by priority', async () => {
    await request(app).post('/todos').send({ title: 'Low task', priority: 'low' }).expect(201);
    await request(app).post('/todos').send({ title: 'High task', priority: 'high' }).expect(201);
    await request(app)
      .post('/todos')
      .send({ title: 'Medium task', priority: 'medium' })
      .expect(201);

    const res = await request(app).get('/todos?priority=high').expect(200);

    assert.equal(res.body.total, 1);
    assert.equal(res.body.items[0].title, 'High task');
    assert.equal(res.body.items[0].priority, 'high');
  });

  test('updates todo priority', async () => {
    const created = await request(app)
      .post('/todos')
      .send({ title: 'Change priority', priority: 'low' })
      .expect(201);

    const updated = await request(app)
      .put(`/todos/${created.body._id}`)
      .send({ priority: 'high' })
      .expect(200);

    assert.equal(updated.body.priority, 'high');
  });

  test('rejects invalid sortOrder values', async () => {
    const invalidValues = [-1, 1.5, 1000001, 'abc'];
    for (const sortOrder of invalidValues) {
      const res = await request(app)
        .post('/todos')
        .send({ title: 'Invalid sortOrder', sortOrder })
        .expect(400);

      assert.ok(res.body.error);
    }
  });

  test('accepts boundary sortOrder values', async () => {
    const minRes = await request(app)
      .post('/todos')
      .send({ title: 'Min sortOrder', sortOrder: 0 })
      .expect(201);
    assert.equal(minRes.body.sortOrder, 0);

    const maxRes = await request(app)
      .post('/todos')
      .send({ title: 'Max sortOrder', sortOrder: 1000000 })
      .expect(201);
    assert.equal(maxRes.body.sortOrder, 1000000);
  });

  test('returns deterministic ordering for identical sortOrder', async () => {
    const created = [];
    created.push(await request(app).post('/todos').send({ title: 'A', sortOrder: 10 }).expect(201));
    created.push(await request(app).post('/todos').send({ title: 'B', sortOrder: 10 }).expect(201));
    created.push(await request(app).post('/todos').send({ title: 'C', sortOrder: 10 }).expect(201));

    const expectedOrder = [created[2].body._id, created[1].body._id, created[0].body._id];

    const first = await request(app).get('/todos?sort=sortOrder:asc').expect(200);
    const second = await request(app).get('/todos?sort=sortOrder:asc').expect(200);

    const firstIds = first.body.items.map((item) => item._id);
    const secondIds = second.body.items.map((item) => item._id);

    assert.deepEqual(firstIds, expectedOrder);
    assert.deepEqual(secondIds, expectedOrder);
  });

  test('returns consistent ordering for board-scoped queries', async () => {
    const boardId = 'board-1';
    await request(app).post('/todos').send({ title: 'B-2', boardId, sortOrder: 2 }).expect(201);
    await request(app).post('/todos').send({ title: 'B-1', boardId, sortOrder: 1 }).expect(201);
    await request(app).post('/todos').send({ title: 'B-3', boardId, sortOrder: 3 }).expect(201);
    await request(app)
      .post('/todos')
      .send({ title: 'Other board', boardId: 'board-2', sortOrder: 1 })
      .expect(201);

    const listRes = await request(app)
      .get(`/todos?boardId=${boardId}&sort=sortOrder:asc`)
      .expect(200);
    const boardRes = await request(app)
      .get(`/boards/${boardId}/todos?sort=sortOrder:asc`)
      .expect(200);

    const listIds = listRes.body.items.map((item) => item._id);
    const boardIds = boardRes.body.todos.map((item) => item._id);

    assert.equal(listRes.body.total, 3);
    assert.equal(listRes.body.items.length, 3);
    assert.deepEqual(listIds, boardIds);
  });
});
