// middlewares/error.js

// 共通エラーハンドラ
module.exports = (err, req, res, next) => {
  // ログ（開発中はスタックも表示）
  console.error('🔥 Error caught by middleware:', err);

  // ステータスコード（err.status があればそれを使う）
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // 開発環境と本番環境で出力を分ける
  if (process.env.NODE_ENV === 'production') {
    // 本番では安全な情報のみ返す
    res.status(status).json({ error: message });
  } else {
    // 開発中はスタックトレースも返す
    res.status(status).json({
      error: message,
      stack: err.stack,
    });
  }
};
