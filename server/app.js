// server/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import todosRouter from './routes/todos.js';
import boardsRouter from './routes/boards.js';
import errorHandler from './middlewares/error.js';
import userRoutes from '../routes/userRoutes.js';
import authRoutes from './routes/auth.js';
import config from './config/index.js';
import buildCspDirectives from './config/csp.js';
import { createCorsOptions } from './config/cors.js';
import openapiSpec from './config/openapi.js';

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
    skip: (req) => req.path === '/health',
  });
  app.use(limiter);

  // ルート（トップページ）
  app.get('/', (_req, res) => res.json({ ok: true }));

  // --- ヘルスチェック ---
  app.get('/health', (_req, res) => res.json({ ok: true }));

  // --- 基本設定 ---
  const corsOptions = createCorsOptions({
    nodeEnv: config.nodeEnv,
    corsOrigin: config.corsOrigin,
  });
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
  app.use(express.json());

  const docsCspDirectives = {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:'],
    fontSrc: ["'self'", 'data:'],
    connectSrc: ["'self'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    frameAncestors: ["'none'"],
    formAction: ["'self'"],
  };

  app.use(
    '/docs',
    helmet.contentSecurityPolicy({ useDefaults: false, directives: docsCspDirectives }),
    swaggerUi.serve,
    swaggerUi.setup(openapiSpec, {
      explorer: true,
      customSiteTitle: 'Todo API Docs',
    })
  );

  // --- ルーター ---
  app.use('/auth', authRoutes);
  app.use('/todos', todosRouter);
  app.use('/boards', boardsRouter);
  app.use('/', userRoutes);

  // --- エラーハンドラ ---
  app.use(errorHandler);

  return app;
}
