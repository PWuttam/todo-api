// server/models/todo.js
// ============================================
// 🔹 Todoモデル：MongoDB上のデータ構造を定義
// ============================================

import mongoose from 'mongoose'; // ✅ require → import に変更
const { Schema, model } = mongoose;

const todoSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    tags: { type: [String], default: [] },
    boardId: { type: String, index: true },
  },
  { timestamps: true }
);

// 検索・並び替えのパフォーマンス向上
todoSchema.index({ status: 1, dueDate: 1, createdAt: -1 });
todoSchema.index({ title: 'text' }); // タイトル検索（text検索を使う場合）

// ✅ ESMでは export default を使用
export default model('Todo', todoSchema);
