# todo-api リポジトリ完全ガイド

**最終更新**: 2026-01-10
**対象**: Claude AI による開発支援

---

## 📋 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [技術スタック](#2-技術スタック)
3. [アーキテクチャ](#3-アーキテクチャ)
4. [ディレクトリ構造](#4-ディレクトリ構造)
5. [データモデル](#5-データモデル)
6. [API エンドポイント](#6-api-エンドポイント)
7. [開発パターン](#7-開発パターン)
8. [環境設定](#8-環境設定)
9. [Issue 状況](#9-issue-状況)
10. [重要な制約事項](#10-重要な制約事項)

---

## 1. プロジェクト概要

### 目的
Trello 風のタスク管理システムのバックエンド REST API

### 特徴
- **最小構成**: 必要な機能のみを実装
- **既存パターン重視**: 新しい機能は既存コードのパターンを踏襲
- **段階的開発**: Issue ベースで機能を追加

### 現在の状態
- **Todo API**: 完成 (CRUD + フィルタ/ソート/ページネーション)
- **Board API**: 基本機能完成 (一覧取得、Board別Todo取得)
- **User API**: 認証情報取得のみ (GET /me)
- **認証**: 未実装（`req.user` に情報がある前提でコードを書く）

---

## 2. 技術スタック

### Runtime & Framework
- **Node.js**: 18+
- **Express**: 5.1.0
- **ES Modules**: `"type": "module"` を使用

### Database
- **MongoDB**: 7 (Docker で起動)
- **Mongoose**: 8.8.0 (ODM)

### Validation & Security
- **express-validator**: 7.3.1 (入力検証)
- **helmet**: 8.1.0 (セキュリティヘッダ)
- **express-rate-limit**: 8.2.1 (DDoS 対策)
- **cors**: 2.8.5
- **joi**: 18.0.1 (環境変数バリデーション)

### Logging
- **morgan**: 1.10.1 (HTTP アクセスログ)
- **pino**: 10.1.0 (構造化ログ)

### Development
- **nodemon**: 3.1.11 (ホットリロード)
- **ESLint**: 9.39.1 + Prettier
- **TypeScript**: 5.9.3 (学習用、本番未使用)

### Testing
- **supertest**: 7.1.4 (HTTP テスト)
- **Node.js built-in test runner**: `node --test`

---

## 3. アーキテクチャ

### レイヤー構造

```
Client Request
      ↓
[Route Layer]          server/routes/*.js
      ↓
[Controller Layer]     server/controllers/*.controller.js
      ↓
[Service Layer]        server/services/*.service.js
      ↓
[Model Layer]          server/models/*.js
      ↓
MongoDB
```

### 責務分離

| Layer      | 責務                                           | 例                           |
| ---------- | ---------------------------------------------- | ---------------------------- |
| Route      | エンドポイント定義、ミドルウェア適用           | `router.get('/', getBoards)` |
| Controller | リクエスト検証、レスポンス整形、エラー処理     | `getBoards(req, res, next)`  |
| Service    | ビジネスロジック、DB アクセス                  | `getBoardsByOwnerId(id)`     |
| Model      | データ構造定義、バリデーションルール、インデックス | `boardSchema`                |

### エラーハンドリングフロー

```
Controller/Route
  ↓ (catch (e) { next(e); })
[Global Error Handler]
  server/middlewares/error.js
  ↓
Client Response: { error: "message", stack?: "..." }
```

---

## 4. ディレクトリ構造

```
todo-api/
├── server/                    # メインアプリケーション
│   ├── app.js                 # Express アプリ定義（テスト用）
│   ├── server.js              # サーバー起動スクリプト
│   ├── config/
│   │   ├── index.js           # 環境変数バリデーション (Joi)
│   │   └── db.js              # MongoDB 接続
│   ├── models/
│   │   ├── todo.js            # Todo データモデル
│   │   └── board.js           # Board データモデル
│   ├── services/
│   │   ├── todos.service.js   # Todo DB 操作
│   │   └── boards.service.js  # Board DB 操作
│   ├── controllers/
│   │   ├── todos.controller.js   # Todo リクエスト処理
│   │   ├── boards.controller.js  # Board リクエスト処理
│   │   └── users.controller.js   # User リクエスト処理
│   ├── routes/
│   │   ├── todos.js           # /todos エンドポイント
│   │   └── boards.js          # /boards エンドポイント
│   ├── middlewares/
│   │   └── error.js           # グローバルエラーハンドラ
│   └── package.json           # server 用依存関係
│
├── routes/                    # ルート直下のルート（歴史的理由）
│   └── userRoutes.js          # /users エンドポイント（/users/me）
│
├── utils/
│   └── asyncHandler.js        # async/await エラーラッパー
│
├── middlewares/
│   └── error.js               # 旧エラーハンドラ（未使用？）
│
├── scripts/
│   └── seed.js                # DB 初期データ投入
│
├── data/
│   └── seed.todos.json        # サンプル Todo データ
│
├── docs/
│   ├── pm-brief.md            # プロジェクト概要（PM 向け）
│   ├── dev-notes.md           # 開発メモ
│   └── learning/              # TypeScript 学習ログ
│
├── tests/
│   └── todos.test.js          # Todo API テスト
│
├── .env.example               # 環境変数テンプレート
├── .env.docker                # Docker 用環境変数
├── docker-compose.yml         # Docker 構成
├── Makefile                   # Docker 操作コマンド
└── package.json               # ルート依存関係
```

### 注意点
- **server/ 配下**: メインの API コード
- **routes/userRoutes.js**: ルート直下にあるが、server/routes/ に統合すべき（Issue 未作成）
- **middlewares/error.js**: 2 つ存在（server/middlewares/error.js が使用中）

---

## 5. データモデル

### 5.1 Todo モデル

**ファイル**: `server/models/todo.js`

```javascript
{
  title: String (required, trim),
  description: String (default: ''),
  dueDate: Date (optional),
  status: String (enum: ['pending', 'in-progress', 'completed'], default: 'pending'),
  tags: [String] (default: []),
  boardId: String (index: true),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**インデックス**:
- `{ status: 1, dueDate: 1, createdAt: -1 }`
- `{ title: 'text' }` (全文検索用)
- `{ boardId: 1 }` (Board との関連)

### 5.2 Board モデル

**ファイル**: `server/models/board.js`

```javascript
{
  name: String (required, trim),
  ownerId: String (required, index: true),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**インデックス**:
- `{ ownerId: 1, createdAt: -1 }` (ユーザー別 Board 取得の高速化)

**設計意図**:
- `ownerId`: 認証済みユーザー ID を格納（User モデルは未実装）
- `boardId` (Todo): この Board に属する Todo を識別

### 5.3 User モデル

**ファイル**: 未実装

**想定フィールド**:
```javascript
{
  id: String,
  name: String,
  email: String,
  password: String (ハッシュ化済み、レスポンスから除外)
}
```

**現在の扱い**:
- 認証ミドルウェアが `req.user` に以下を設定すると想定:
  ```javascript
  req.user = { id: '...', name: '...', email: '...' }
  ```

---

## 6. API エンドポイント

### Base URL
- **開発**: `http://localhost:3000`
- **Docker**: `http://localhost:3000`

### 6.1 Health Check

| Method | Path       | 説明                 | 認証 |
| ------ | ---------- | -------------------- | ---- |
| GET    | `/`        | ヘルスチェック       | 不要 |
| GET    | `/health`  | ヘルスチェック       | 不要 |

**レスポンス**: `{ "ok": true }`

---

### 6.2 Todos API

**Base**: `/todos`

| Method | Path            | 説明                 | Controller 関数       | 認証 |
| ------ | --------------- | -------------------- | --------------------- | ---- |
| GET    | `/todos`        | Todo 一覧取得        | `getTodos`            | 不要 |
| POST   | `/todos`        | Todo 作成            | `createTodo`          | 不要 |
| PUT    | `/todos/:id`    | Todo 更新            | `updateTodo`          | 不要 |
| DELETE | `/todos/:id`    | Todo 削除            | `deleteTodo`          | 不要 |

#### GET /todos クエリパラメータ

| パラメータ | 型     | 説明                                | 例                        |
| ---------- | ------ | ----------------------------------- | ------------------------- |
| `status`   | string | ステータスフィルタ                  | `?status=pending`         |
| `tag`      | string | タグフィルタ (カンマ区切り)         | `?tag=api,backend`        |
| `q`        | string | タイトル部分一致検索                | `?q=readme`               |
| `sort`     | string | ソートフィールド:方向               | `?sort=dueDate:asc`       |
| `page`     | number | ページ番号 (1〜)                    | `?page=2`                 |
| `limit`    | number | 1 ページあたりの件数 (max: 100)     | `?limit=50`               |
| `boardId`  | string | 特定 Board の Todo のみ取得         | `?boardId=abc123`         |

**レスポンス例**:
```json
{
  "items": [...],
  "page": 1,
  "limit": 20,
  "total": 42,
  "pages": 3,
  "sort": "createdAt:desc",
  "filters": { "status": "pending", "tag": null, "q": null }
}
```

#### POST /todos リクエストボディ

```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "status": "pending | in-progress | completed (optional)",
  "tags": ["string"] (optional),
  "dueDate": "ISO 8601 date string (optional)",
  "boardId": "string (optional)"
}
```

**バリデーション**: express-validator (controller 層)

---

### 6.3 Boards API

**Base**: `/boards`

| Method | Path                   | 説明                            | Controller 関数       | 認証 |
| ------ | ---------------------- | ------------------------------- | --------------------- | ---- |
| GET    | `/boards`              | ユーザーの Board 一覧取得       | `getBoards`           | 必須 |
| GET    | `/boards/:boardId/todos` | 特定 Board の Todo 一覧取得   | `getTodosByBoardId`   | 不要 |

#### GET /boards

**認証**: `req.user.id` が必要

**レスポンス**:
```json
{
  "boards": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "My Project",
      "createdAt": "2025-01-01T12:00:00.000Z"
    }
  ]
}
```

#### GET /boards/:boardId/todos

**説明**: `/todos?boardId=xxx` と同じ結果を返す（正規エンドポイント）

**レスポンス**:
```json
{
  "todos": [...]
}
```

---

### 6.4 Users API

**Base**: `/users`

| Method | Path         | 説明                         | Controller 関数 | 認証 |
| ------ | ------------ | ---------------------------- | --------------- | ---- |
| GET    | `/users/me`  | 認証済みユーザー情報取得     | `getMe`         | 必須 |
| GET    | `/users`     | テスト用ユーザー一覧         | (inline)        | 不要 |

#### GET /users/me

**認証**: `req.user` が必要

**レスポンス**:
```json
{
  "id": "user123",
  "name": "John Doe",
  "email": "john@example.com"
}
```

**エラー**:
```json
{ "error": "Unauthorized" }  // 401
```

---

## 7. 開発パターン

### 7.1 新しいエンドポイントの追加手順

既存コードを参考に、以下の順序で実装する:

#### 1. Model (必要な場合のみ)
- `server/models/*.js` に Mongoose スキーマを定義
- 既存: `todo.js`, `board.js`

#### 2. Service
- `server/services/*.service.js` に DB 操作関数を作成
- 命名: `get*, create*, update*, delete*`

#### 3. Controller
- `server/controllers/*.controller.js` にリクエスト処理を作成
- バリデーション: express-validator
- エラーハンドリング: `try { ... } catch (e) { next(e); }`

#### 4. Route
- `server/routes/*.js` にルート定義
- 認証が必要な場合: 認証ミドルウェアを追加（未実装なので `req.user` チェックを controller で行う）

#### 5. サーバーに登録
- `server/server.js` または `server/app.js` の `app.use()` で登録

### 7.2 コーディング規約

#### エラーハンドリング
```javascript
// ✅ 推奨（既存パターン）
export const someHandler = async (req, res, next) => {
  try {
    // ...
  } catch (e) {
    next(e); // グローバルハンドラに委譲
  }
};
```

```javascript
// ❌ 非推奨
export const someHandler = async (req, res) => {
  try {
    // ...
  } catch (e) {
    res.status(500).json({ error: e.message }); // 個別処理しない
  }
};
```

#### 認証チェック
```javascript
// ✅ 推奨（既存パターン）
if (!req.user || !req.user.id) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

#### バリデーション
```javascript
// ✅ 推奨（既存パターン: express-validator）
export const validateCreate = [
  body('title').isString().trim().notEmpty().withMessage('title is required'),
];

export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation error',
      details: errors.array(),
    });
  }
  next();
};

// Route: router.post('/', validateCreate, handleValidation, createHandler);
```

#### レスポンス形式
```javascript
// ✅ 一覧取得: 配列をオブジェクトでラップ
res.json({ boards: [...] });
res.json({ todos: [...] });

// ✅ 単一取得/作成: 直接返す
res.json({ id: '...', name: '...' });

// ✅ エラー: { error: "message" }
res.status(404).json({ error: 'Not found' });
```

### 7.3 MongoDB ID の扱い

```javascript
// ✅ 推奨: _id を toString() して id として返す
const payload = boards.map((board) => ({
  id: board._id.toString(),
  name: board.name,
}));

// ❌ 非推奨: _id をそのまま返す（ObjectId 型になる）
```

### 7.4 async/await ラッパー

**ファイル**: `utils/asyncHandler.js`

```javascript
// Route で使用
router.get('/me', asyncHandler(getMe));

// Controller は async 関数として定義
export const getMe = async (req, res) => {
  // ...
};
```

**効果**: Promise の reject を自動的に `next(e)` に変換

---

## 8. 環境設定

### 8.1 環境変数

**ファイル**: `.env.example` (ホスト実行用)

```bash
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/todo_api
CORS_ORIGIN=http://localhost:5173
```

**Docker 用**: `.env.docker`

```bash
# docker-compose.yml で env_file として読み込まれる
```

### 8.2 バリデーション

**ファイル**: `server/config/index.js`

- **ライブラリ**: Joi
- **必須**: `MONGODB_URI`
- **デフォルト**: `PORT=3000`, `NODE_ENV=development`, `CORS_ORIGIN=*`

### 8.3 起動方法

#### ホスト実行
```bash
cd server
npm install
npm run dev   # nodemon
npm start     # 本番モード
```

#### Docker 実行
```bash
docker compose up -d    # API + MongoDB
docker compose down
make up                 # Makefile
make logs
make seed               # データ投入
```

### 8.4 データ投入

**スクリプト**: `scripts/seed.js`

```bash
# 固定サンプル 10 件にリセット
node scripts/seed.js --reset --file ../data/seed.todos.json

# ランダムデータを 40 件まで補充
node scripts/seed.js --count 40

# シード値を指定してランダム生成
node scripts/seed.js --random --count 100 --seed 42
```

---

## 9. Issue 状況

### 完了 (CLOSED)

| Issue | タイトル                                      | 実装内容                          |
| ----- | --------------------------------------------- | --------------------------------- |
| #26   | Implement GET /me endpoint                    | `GET /users/me` (認証済みユーザー情報) |
| #25   | Implement GET /boards endpoint                | `GET /boards` (Board 一覧)        |
| #16   | Automate smoke.sh in CI pipeline              | CI/CD                             |
| #15   | Add request logging and security middlewares  | helmet, morgan, rate-limit        |
| #46   | Enable automatic restart in docker-compose    | Docker                            |

### 未実装 (OPEN)

| Issue | タイトル                                      | 説明                              |
| ----- | --------------------------------------------- | --------------------------------- |
| #23   | Add sortOrder field to List and Card models   | drag & drop 並び替え用フィールド  |
| #24   | Extend Task model with dueDate, priority, tags[] | Todo モデル拡張（一部実装済み） |
| #37-41| Security improvements                         | CORS, CSP, HSTS, レート制限改善   |
| #17   | Plan migration to TypeScript                  | TS 移行検討                       |
| #18   | Expand documentation                          | デプロイガイド等                  |

---

## 10. 重要な制約事項

### 10.1 開発方針

#### ✅ **すべきこと**
- 既存のコードパターンを踏襲する
- Controller → Service → Model の 3 層構造を維持
- エラーハンドリングは `next(e)` でグローバルハンドラに委譲
- express-validator でバリデーション
- レスポンスは `{ error: "..." }` 形式

#### ❌ **してはいけないこと**
- 既存コードのリファクタリング（Issue で明示されていない限り）
- 新しい認証方式の導入（認証ミドルウェアは未実装のまま）
- ディレクトリ構造の大幅な変更
- 他の Issue に影響する変更
- 「将来のため」の過剰な抽象化

### 10.2 認証の扱い

**現状**: 認証ミドルウェアは未実装

**開発時の対応**:
1. `req.user` が存在する前提でコードを書く
2. Controller で `if (!req.user) return 401` をチェック
3. テスト時は `req.user` をモックする

**例**:
```javascript
// routes/userRoutes.js にテスト用ミドルウェアを追加
router.use((req, res, next) => {
  req.user = { id: '123', name: 'Test', email: 'test@example.com' };
  next();
});
```

### 10.3 ファイル配置の歴史的経緯

**現状の不統一**:
- `routes/userRoutes.js`: ルート直下
- `server/routes/todos.js`, `server/routes/boards.js`: server 配下

**理由**: 段階的開発による

**対応**: 統一する Issue は未作成。現状維持。

---

## 11. テスト

### 11.1 ユニットテスト

**ファイル**: `tests/todos.test.js`

**実行**:
```bash
npm test
```

### 11.2 スモークテスト

**ファイル**: `scripts/smoke.sh`

**実行**:
```bash
./scripts/smoke.sh          # ホスト
make smoke                  # Docker
```

### 11.3 手動テスト

```bash
# Health check
curl http://localhost:3000/health

# Todo 作成
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","status":"pending"}'

# Board 一覧（要認証モック）
curl http://localhost:3000/boards

# ユーザー情報（要認証モック）
curl http://localhost:3000/users/me
```

---

## 12. 参考資料

- **README.md**: プロジェクト概要（英語）
- **README.ja.md**: プロジェクト概要（日本語）
- **docs/pm-brief.md**: PM 向けプロジェクト説明
- **docs/dev-notes.md**: 開発メモ
- **docs/learning/**: TypeScript 学習ログ

---

## 13. よくある質問

### Q1: 新しい API エンドポイントを追加する際の手順は？

**A**: 「7.1 新しいエンドポイントの追加手順」を参照

### Q2: 認証が必要なエンドポイントはどう実装する？

**A**: Controller で `req.user` の存在をチェックし、なければ `401` を返す。認証ミドルウェアは未実装。

### Q3: エラーハンドリングのベストプラクティスは？

**A**: `try { ... } catch (e) { next(e); }` でグローバルエラーハンドラに委譲。個別の error レスポンスは書かない。

### Q4: MongoDB の ObjectId を JSON で返すには？

**A**: `.toString()` で文字列化する。

```javascript
id: board._id.toString()
```

### Q5: Board と Todo の関係は？

**A**:
- Board: ユーザーが所有する「プロジェクト」のようなもの
- Todo: Board に属するタスク（`boardId` フィールド）
- 1 つの Board に複数の Todo が属する（1 対多）

### Q6: Issue #23, #24 はなぜ未実装？

**A**: 将来の拡張予定。現在は基本機能の実装を優先。

### Q7: TypeScript への移行予定は？

**A**: Issue #17 で検討中。現在は ES Modules (JavaScript) で実装。

---

**文書終わり**
