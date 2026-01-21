// server/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import todosRouter from './routes/todos.js';
import boardsRouter from './routes/boards.js';
import errorHandler from './middlewares/error.js';
import userRoutes from '../routes/userRoutes.js';
import config from './config/index.js';
import buildCspDirectives from './config/csp.js';

export function createApp() {
  const app = express();

  console.log('🌱 NODE_ENV:', config.nodeEnv);

  // --- ログ ---
  app.use(morgan('combined'));

  // --- セキュリティ ---
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
  app.use(
    helmet.contentSecurityPolicy({
      useDefaults: false,
      directives: buildCspDirectives(),
    })
  );

  // --- レートリミット（DoS対策）---
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.',
  });
  app.use(limiter);

  // ルート（トップページ）
  app.get('/', (_req, res) => res.json({ ok: true }));

  // --- ヘルスチェック ---
  app.get('/health', (_req, res) => res.json({ ok: true }));

  // --- 基本設定 ---
  app.use(cors());
  app.use(express.json());

  // --- ルーター ---
  app.use('/todos', todosRouter);
  app.use('/boards', boardsRouter);
  app.use('/', userRoutes);

  // --- エラーハンドラ ---
  app.use(errorHandler);

  return app;
}
