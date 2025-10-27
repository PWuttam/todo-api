// server/controllers/todos.controller.js
const { body, validationResult } = require('express-validator');
const todoService = require('../services/todos.service');

// Validation rules
exports.validateCreate = [
  body('title').isString().trim().notEmpty().withMessage('title is required'),
  body('status').optional().isIn(['pending', 'in-progress', 'completed']),
];

exports.validateUpdate = [
  body('title').optional().isString().trim().notEmpty(),
  body('status').optional().isIn(['pending', 'in-progress', 'completed']),
];

// Common validation check
exports.handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation error',
      details: errors.array(),
    });
  }
  next();
};

// CREATE
exports.createTodo = async (req, res) => {
  try {
    const todo = await todoService.createTodo(req.body);
    res.status(201).json(todo);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// READ
exports.getTodos = async (req, res, next) => {
  try {
    const { status, tag, q, sort = 'createdAt:desc', page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const allowSort = new Set(['createdAt', 'updatedAt', 'dueDate', 'title', 'status']);
    const [rawField, rawDir] = String(sort).split(':');
    const sortField = allowSort.has(rawField) ? rawField : 'createdAt';
    const sortDir = rawDir === 'asc' ? 1 : -1;
    const sortObj = { [sortField]: sortDir };

    const query = {};
    if (status) query.status = status;
    if (tag) {
      const tags = String(tag)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (tags.length) query.tags = { $in: tags };
    }
    if (q && String(q).trim()) {
      query.title = { $regex: String(q).trim(), $options: 'i' };
    }

    const { items, total } = await todoService.getTodos(query, { sortObj, pageNum, limitNum });

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
};

// UPDATE
exports.updateTodo = async (req, res) => {
  try {
    const updated = await todoService.updateTodo(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// DELETE
exports.deleteTodo = async (req, res) => {
  const deleted = await todoService.deleteTodo(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
};