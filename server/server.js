// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const todosRouter = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// DB接続（失敗時はプロセス終了）
connectDB().catch(err => {
  console.error('DB connection error:', err.message);
  process.exit(1);
});

// Health
app.get('/', (_req, res) => res.json({ ok: true, message: 'Server is running 🚀' }));

// ここで /todos を有効化
app.use('/todos', todosRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
