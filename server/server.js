// server/server.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import todosRouter from './routes/todos.js';
import boardsRouter from './routes/boards.js';
import errorHandler from './middlewares/error.js';
import userRoutes from '../routes/userRoutes.js';
import config from './config/index.js';
import buildCspDirectives from './config/csp.js';

console.log('🌱 NODE_ENV:', config.nodeEnv);

const app = express();
const PORT = config.port;
// まずは IPv4 に固定（確実に curl できる）。必要なら '0.0.0.0' や '::1' に変更
const HOST = '0.0.0.0';

// --- 一番最初に morgan を登録（アクセスログ用） ---
app.use(morgan('combined'));
// 例: ::1 - GET /users 200 15 - 2.345 ms

// セキュリティヘッダーを有効化
// HSTS is disabled by default and enabled only in production (see below)
app.use(
  helmet({
    hsts: false,
    contentSecurityPolicy: false,
  })
);
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: false,
    directives: buildCspDirectives(),
  })
);

// HSTS (HTTP Strict-Transport-Security): 本番環境のみ有効化
// 開発・テスト環境ではHTTPSが利用できないことがあるため、HSTSを無効にする
if (process.env.NODE_ENV === 'production') {
  app.use(
    helmet.hsts({
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
    })
  );
}

// 🚫 アクセス制限（DoS対策）
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // 各IPごとに最大100リクエスト
  message: 'Too many requests, please try again later.',
});
app.use(limiter);

// ルート（トップページ）
app.get('/', (_req, res) => res.json({ ok: true }));

app.get('/health', (_req, res) => res.json({ ok: true }));

// CORS設定: 開発環境は全許可、本番環境はALLOWED_ORIGINSのみ許可
const corsOptions = {
  origin: (origin, callback) => {
    // Non-browser requests (curl, server-to-server) have no origin
    if (!origin) {
      return callback(null, true);
    }

    // Development: allow all origins
    if (config.nodeEnv !== 'production') {
      return callback(null, true);
    }

    // Production: check against ALLOWED_ORIGINS
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
          .map((o) => o.trim())
          .filter(Boolean)
      : [];

    if (allowedOrigins.length === 0) {
      return callback(new Error('CORS rejected: ALLOWED_ORIGINS not configured for production'));
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS rejected: origin ${origin} not allowed`));
  },
};

app.use(cors(corsOptions));
app.use(express.json());

// ルート
app.use('/todos', todosRouter);
app.use('/boards', boardsRouter);

// userRoutes を登録
app.use('/', userRoutes);

// 共通エラーハンドラ（最後）
app.use(errorHandler);

// 起動まわりのエラーハンドリングを可視化
process.on('unhandledRejection', (r) => {
  console.error('UNHANDLED REJECTION:', r);
});
process.on('uncaughtException', (e) => {
  console.error('UNCAUGHT EXCEPTION:', e);
  // process.exit(1); //
});

async function start() {
  try {
    await connectDB();

    const server = app.listen(PORT, HOST, () => {
      const addr = server.address();

      // 3. addr が null の場合は安全に処理
      if (!addr) {
        console.log('Server started, but address() returned null');
        return;
      }

      // 4. 正常なら住所（HOSTとPORT）を表示
      console.log(`Listening on ${addr.address}:${addr.port} (${addr.family})`);
    });

    // 5. サーバー起動時のエラーをキャッチ
    server.on('error', (err) => {
      console.error('Server listen error:', err);
    });
  } catch (err) {
    // 6. DB接続に失敗したらエラーメッセージを出して終了
    console.error('Startup error (DB connection failed):', err);
    process.exit(1);
  }
}

start();
