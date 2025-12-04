// server/config/index.js
import dotenv from 'dotenv';
import Joi from 'joi';

// ① .envファイルを読み込む
dotenv.config();

// ② Joiで環境変数の形式をチェック
const schema = Joi.object({
  PORT: Joi.number().default(3000), // ← .envに書かれてなくてもOK
  MONGODB_URI: Joi.string().required().messages({
    'any.required': '❌ MONGODB_URI が設定されていません',
  }),
  CORS_ORIGIN: Joi.string().default('*'), // ← フロントのURLなど
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test') // ← Jestなども考慮
    .default('development'),
}).unknown(true); // .envに他の値があっても無視OK

// ③ 実際にバリデーションを実行
const { value: env, error } = schema.validate(process.env);

if (error) {
  console.error('❌ 環境変数のエラー:', error.message);
  process.exit(1); // ← エラーなら起動ストップ
}

// ④ 使いやすい形でエクスポート
const config = {
  port: env.PORT,
  mongoUri: env.MONGODB_URI || env.MONGO_URI || 'mongodb://127.0.0.1:27017/todo_api',
  corsOrigin: env.CORS_ORIGIN,
  nodeEnv: env.NODE_ENV,
};

export default config;
