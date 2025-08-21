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

module.exports = model('Todo', todoSchema);
