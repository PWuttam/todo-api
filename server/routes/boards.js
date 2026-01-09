// server/routes/boards.js
import express from 'express';
import { getBoards } from '../controllers/boards.controller.js';
import { getTodosByBoardId } from '../controllers/todos.controller.js';

const router = express.Router();

router.get('/', getBoards);
router.get('/:boardId/todos', getTodosByBoardId);

export default router;
