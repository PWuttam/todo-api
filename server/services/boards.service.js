// server/services/boards.service.js
// ============================================
// 🔹 役割：Boardデータの実際の操作（DB処理）を行う
// ============================================

import Board from '../models/board.js';

// READ（ユーザーのBoard一覧取得）
export async function getBoardsByOwnerId(ownerId) {
  return await Board.find({ ownerId }).sort({ createdAt: -1 }).select({ name: 1, createdAt: 1 });
}
