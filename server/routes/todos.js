// server/routes/todos.js
import express from 'express';
import * as controller from '../controllers/todos.controller.js';

const router = express.Router();

router.post('/', controller.validateCreate, controller.handleValidation, controller.createTodo);

router.get('/', controller.getTodos);

router.put('/:id', controller.validateUpdate, controller.handleValidation, controller.updateTodo);

router.delete('/:id', controller.deleteTodo);

// ✅ デフォルトエクスポート
export default router;
