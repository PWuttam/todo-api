// server/models/todo.js
const { Schema, model } = require('mongoose');

const todoSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    },
    tags: { type: [String], default: [] }
  },
  { timestamps: true }
);

// 検索・並び替えのパフォーマンス向上
todoSchema.index({ status: 1, dueDate: 1, createdAt: -1 });
todoSchema.index({ title: 'text' }); // タイトル検索（text検索を使う場合）

module.exports = model('Todo', todoSchema);
