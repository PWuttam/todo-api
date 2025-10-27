// server/routes/todos.js
const express = require('express');
const controller = require('../controllers/todos.controller');

const router = express.Router();

router.post(
  '/',
  controller.validateCreate,
  controller.handleValidation,
  controller.createTodo
);

router.get('/', controller.getTodos);

router.put(
  '/:id',
  controller.validateUpdate,
  controller.handleValidation,
  controller.updateTodo
);

router.delete('/:id', controller.deleteTodo);

module.exports = router;