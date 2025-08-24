// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const todosRouter = require('./routes/todos');
const errorHandler = require('./middlewares/error'); // 読み込みはここでOK

const app = express();                       // ← app を先に作る
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// DB接続（失敗時は終了）
connectDB().catch(err => {
  console.error('DB connection error:', err.message);
  process.exit(1);
});

// Health
app.get('/', (_req, res) => res.json({ ok: true, message: 'Server is running 🚀' }));

// ルート
app.use('/todos', todosRouter);

// いちばん最後：共通エラーハンドラ
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
