// server/controllers/boards.controller.js

// ============================================
// 🔹 役割：Board関連のリクエストを処理
// ============================================

import * as boardService from '../services/boards.service.js';
import { createHttpError } from '../utils/http-errors.js';

// ============================================
// 🔸 GET /boards - 認証済みユーザーのBoard一覧
// ============================================
export const getBoards = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(createHttpError(401, 'Unauthorized', 'UNAUTHORIZED'));
    }

    const boards = await boardService.getBoardsByOwnerId(String(req.user.id));
    const payload = boards.map((board) => ({
      id: board._id.toString(),
      name: board.name,
      createdAt: board.createdAt,
    }));

    return res.json({ boards: payload });
  } catch (e) {
    return next(e);
  }
};
