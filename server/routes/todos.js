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

// READ (GET /todos) 一覧取得 + 検索/ソート/ページング
router.get('/', async (req, res, next) => {
  try {
    const {
      status,
      tag,
      q,
      sort = 'createdAt:desc',
      page = '1',
      limit = '20',
    } = req.query;

    // バリデーション/サニタイズ
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const allowSort = new Set(['createdAt', 'updatedAt', 'dueDate', 'title', 'status']);
    const [rawField, rawDir] = String(sort).split(':');
    const sortField = allowSort.has(rawField) ? rawField : 'createdAt';
    const sortDir = rawDir === 'asc' ? 1 : -1;
    const sortObj = { [sortField]: sortDir };

    // クエリ組み立て
    const query = {};
    if (status) query.status = status; // 'pending' | 'in-progress' | 'completed'
    if (tag) {
      const tags = String(tag).split(',').map(s => s.trim()).filter(Boolean);
      if (tags.length) query.tags = { $in: tags };
    }
    if (q && String(q).trim()) {
      // 部分一致（ケース無視）
      query.title = { $regex: String(q).trim(), $options: 'i' };
      // text indexを使う場合の代替:
      // query.$text = { $search: String(q).trim() };
    }

    const [items, total] = await Promise.all([
      Todo.find(query).sort(sortObj).skip((pageNum - 1) * limitNum).limit(limitNum),
      Todo.countDocuments(query),
    ]);

    res.json({
      items,
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
      sort: `${sortField}:${sortDir === 1 ? 'asc' : 'desc'}`,
      filters: { status: status || null, tag: tag || null, q: q || null },
    });
  } catch (e) {
    next(e);
  }
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
