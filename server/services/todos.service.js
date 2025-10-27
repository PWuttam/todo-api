// server/services/todos.service.js
const Todo = require('../models/todo');

exports.createTodo = async (data) => {
  return await Todo.create(data);
};

exports.getTodos = async (query, options) => {
  const { sortObj, pageNum, limitNum } = options;
  const [items, total] = await Promise.all([
    Todo.find(query)
      .sort(sortObj)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Todo.countDocuments(query),
  ]);
  return { items, total };
};

exports.updateTodo = async (id, data) => {
  return await Todo.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

exports.deleteTodo = async (id) => {
  return await Todo.findByIdAndDelete(id);
};