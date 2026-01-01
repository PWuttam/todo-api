// server/routes/boards.js
import express from 'express';
import { getTodosByBoardId } from '../controllers/todos.controller.js';

const router = express.Router();

router.get('/:boardId/todos', getTodosByBoardId);

export default router;
