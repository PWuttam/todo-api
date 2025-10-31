// routes/userRoutes.js
import express from "express";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

// 確認用：通常ルート
router.get('/', asyncHandler(async (req, res) => {
  const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ];
  res.json(users);
}));

// 確認用：わざとエラーを出すルート
router.get('/error-test', asyncHandler(async (req, res) => {
  throw new Error('テストエラー発生！');
}));

export default router;