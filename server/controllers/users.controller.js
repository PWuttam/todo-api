// server/controllers/users.controller.js

// ============================================
// 🔹 役割：ユーザー関連のリクエストを処理
// ============================================

import { createHttpError } from '../utils/http-errors.js';

// ============================================
// 🔸 GET /me - 認証済みユーザー情報を返す
// ============================================
export const getMe = async (req, res, next) => {
  // 認証ミドルウェアによって req.user に情報が格納されている前提
  if (!req.user) {
    return next(createHttpError(401, 'Unauthorized', 'UNAUTHORIZED'));
  }

  // Issue #26 で指定されたフィールドのみを返す
  return res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
  });
};
