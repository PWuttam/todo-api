// server/services/todos.service.js
// ============================================
// 🔹 役割：Todoデータの実際の操作（DB処理）を行う
// ============================================

import Todo from '../models/todo.js'; // ✅ require → import に変更

// CREATE（Todo新規作成）
export async function createTodo(data) {
  return await Todo.create(data);
}

// READ（Todo一覧取得）
export async function getTodos(query, options) {
  const { sortObj, pageNum, limitNum } = options;
  const [items, total] = await Promise.all([
    Todo.find(query)
      .sort(sortObj)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Todo.countDocuments(query),
  ]);
  return { items, total };
}

// READ（Board別のTodo一覧取得）
export async function getTodosByBoardId(boardId, options = {}) {
  const { sort = { createdAt: -1 } } = options;
  return await Todo.find({ boardId }).sort(sort);
}

// UPDATE（Todo更新）
export async function updateTodo(id, data) {
  return await Todo.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
}

// DELETE（Todo削除）
export async function deleteTodo(id) {
  return await Todo.findByIdAndDelete(id);
}
