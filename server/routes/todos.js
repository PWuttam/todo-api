// server/routes/todos.js
const express = require('express');
const Todo = require('../models/todo');
const router = express.Router();

// CREATE  (POST /todos)
router.post('/', async (req, res) => {
  try {
    const title = req.body?.title;
    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: 'title is required' });
    }
    const todo = await Todo.create(req.body);
    res.status(201).json(todo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// READ (GET /todos) 一覧取得
router.get('/', async (_req, res) => {
  const todos = await Todo.find().sort({ createdAt: -1 });
  res.json(todos);
});

// UPDATE (PUT /todos/:id)
router.put('/:id', async (req, res) => {
  try {
    const updated = await Todo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE (DELETE /todos/:id)
router.delete('/:id', async (req, res) => {
  const deleted = await Todo.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

module.exports = router;
