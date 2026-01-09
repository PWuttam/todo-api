// server/models/board.js
// ============================================
// 🔹 Boardモデル：MongoDB上のデータ構造を定義
// ============================================

import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const boardSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    ownerId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

boardSchema.index({ ownerId: 1, createdAt: -1 });

export default model('Board', boardSchema);
