// server/routes/todos.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const Todo = require('../models/todo');
const router = express.Router();

// 共通: バリデーション結果をチェック
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation error',
      details: errors.array()
    });
  }
  next();
};

// CREATE  (POST /todos)
router.post(
  '/',
  [
    body('title').isString().trim().notEmpty().withMessage('title is required'),
    body('status').optional().isIn(['pending', 'in-progress', 'completed'])
  ],
  handleValidation,
  async (req, res) => {
    try {
      const todo = await Todo.create(req.body);
      res.status(201).json(todo);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
);

// READ (GET /todos)
router.get('/', async (_req, res) => {
  const todos = await Todo.find().sort({ createdAt: -1 });
  res.json(todos);
});

// UPDATE (PUT /todos/:id)
router.put(
  '/:id',
  [
    body('title').optional().isString().trim().notEmpty(),
    body('status').optional().isIn(['pending', 'in-progress', 'completed'])
  ],
  handleValidation,
  async (req, res) => {
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
  }
);

// DELETE (DELETE /todos/:id)
router.delete('/:id', async (req, res) => {
  const deleted = await Todo.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

module.exports = router;
