// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const todosRouter = require('./routes/todos');
const errorHandler = require('./middlewares/error');

const app = express();
const PORT = process.env.PORT || 3000;
// まずは IPv4 に固定（確実に curl できる）。必要なら '0.0.0.0' や '::1' に変更
const HOST = '127.0.0.1';

// --- 最初に必ず見えるログ＆最低限の疎通用ヘルスチェック ---
app.use((req, _res, next) => { console.log(req.method, req.url); next(); });
app.get('/health', (_req, res) => res.json({ ok: true }));

app.use(cors());
app.use(express.json());

// ルート
app.use('/todos', todosRouter);

// 共通エラーハンドラ（最後）
app.use(errorHandler);

// 起動まわりのエラーハンドリングを可視化
process.on('unhandledRejection', (r) => {
  console.error('UNHANDLED REJECTION:', r);
});
process.on('uncaughtException', (e) => {
  console.error('UNCAUGHT EXCEPTION:', e);
  process.exit(1);
});

async function start() {
  try {
    // ✅ DB成功後にだけ listen する
    await connectDB(); // connectにオプションがあるならここで指定
    const server = app.listen(PORT, HOST, () => {
      const addr = server.address();
      console.log(`Listening on ${addr.address}:${addr.port} (${addr.family})`);
    });
    server.on('error', (err) => {
      console.error('Server listen error:', err);
    });
  } catch (err) {
    console.error('Startup error (DB connection failed):', err);
    // 必要ならここで fallback して DBなしでも listen する処理に切り替え可
    process.exit(1);
  }
}

start();
