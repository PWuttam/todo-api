# todo-api

# 📝 ToDoリストAPI / ToDo List API

---

## 🇯🇵 日本語版

Node.js + Express + MongoDB で構築した、シンプルかつ拡張性のあるToDoリストAPIです。タスク管理の基本機能を備え、将来的な機能追加にも対応しやすい構成になっています。

### 📌 背景・目的

このプロジェクトは、個人開発者として以下を目的に作成されています：

- REST API開発の基礎を実践的に学ぶ
- ExpressとMongoDBを使ったCRUD操作の習得
- 将来的に拡張できる構造での設計力向上

### ⚙️ セットアップ手順

```bash
# リポジトリをクローン
git clone https://github.com/your-username/todo-api.git
cd todo-api/server

# 依存パッケージをインストール
npm install

# 環境変数ファイルを作成（例：.env）
cp .env.example .env

# MongoDB接続文字列などを.envに設定

# サーバー起動
npm start
```

### 🛠️ 使用技術とライブラリ

- Node.js
- Express
- MongoDB / Mongoose
- dotenv（環境変数管理）
- Git / GitHub（バージョン管理）

### 🚀 実行方法と使い方

```bash
npm start
```

| メソッド | パス          | 説明         |
|----------|---------------|--------------|
| POST     | `/todos`      | ToDoの追加   |
| GET      | `/todos`      | ToDoの取得   |
| PUT      | `/todos/:id`  | ToDoの更新   |
| DELETE   | `/todos/:id`  | ToDoの削除   |

PostmanなどでJSON形式でリクエストを送信してください。

### 💡 想定される利用ケース

- WebアプリやモバイルアプリのバックエンドAPI
- CLIツールのタスク管理機能
- 個人タスク管理システムのAPI基盤
- API設計・Express学習用教材

### 🌱 今後の改善アイデア

- ユーザー認証（JWT）
- タグ・カテゴリ機能
- 期限付きリマインダー通知
- ステータスによる進捗管理
- ToDoの共有・チーム利用
- Google Calendar など外部カレンダーとの連携

---

## 🇬🇧 English Version

A simple and extensible ToDo List API built with Node.js, Express, and MongoDB. It provides basic task management functionality and is designed for future enhancements.

### 📌 Background & Purpose

This project is created with the following objectives:

- Learn and practice the basics of REST API development
- Gain experience with CRUD operations using Express and MongoDB
- Improve design skills by building an extensible architecture

### ⚙️ Setup Instructions

```bash
# Clone the repository
git clone https://github.com/your-username/todo-api.git
cd todo-api/server

# Install dependencies
npm install

# Create an environment file (e.g., .env)
cp .env.example .env

# Set up MongoDB connection string in .env

# Start the server
npm start
```

### 🛠️ Technologies & Libraries

- Node.js
- Express
- MongoDB / Mongoose
- dotenv (environment variable management)
- Git / GitHub (version control)

### 🚀 Usage

```bash
npm start
```

| Method  | Path         | Description       |
|---------|--------------|-------------------|
| POST    | `/todos`     | Create a new ToDo |
| GET     | `/todos`     | Retrieve ToDos    |
| PUT     | `/todos/:id` | Update a ToDo     |
| DELETE  | `/todos/:id` | Delete a ToDo     |

Send JSON requests using Postman or curl.

### 💡 Use Cases

- Backend API for web or mobile applications
- CLI tool task management backend
- Personal task management system
- Learning resource for API design and Express

### 🌱 Future Improvements

- User authentication (JWT)
- Tags and categories
- Due date reminders
- Task status management (e.g., pending, in-progress, completed)
- Shared ToDos for team collaboration
- Integration with external calendars (e.g., Google Calendar, iOS Calendar)


---

## 🧭 実際に README を含めてプロジェクトを作成する手順（超具体的）

> ここでは **リポジトリ直下に README.md** を置き、API 本体は `server/` 配下に作る前提で説明します。Windows/Mac/Linux どれでも使えるコマンドです（PowerShell でもほぼ同じ）。

### 0. 事前準備（Prerequisites）
- Node.js 18+（`node -v` で確認）
- Git（`git --version`）
- MongoDB がローカル or クラウド（MongoDB Atlas）で使えること
- （任意）GitHub CLI: `gh` コマンド

---

### 1. リポジトリとディレクトリの作成
```bash
# 任意の作業フォルダで
mkdir todo-api && cd todo-api

# Git 初期化
git init

# API サーバー用ディレクトリを作成
mkdir -p server/{models,routes,controllers,config}
```

---

### 2. Node プロジェクト初期化 & 依存関係の導入（server/ 配下）
```bash
cd server
npm init -y

# 本番依存
npm i express mongoose dotenv cors

# 開発依存（ホットリロード・静的解析など）
npm i -D nodemon eslint prettier
```

---

### 3. ベースファイルの作成
**`server.js`**（サーバー起動）
```javascript
// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const todosRouter = require('./routes/todos');

const app = express();
app.use(cors());
app.use(express.json());

// DB 接続
connectDB();

// ルート
app.use('/todos', todosRouter);

// ヘルスチェック
app.get('/', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
```

**`config/db.js`**（MongoDB 接続）
```javascript
// server/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/todo_api';
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined });
  console.log('MongoDB connected');
};

module.exports = { connectDB };
```

**`models/todo.js`**（ToDo モデル）
```javascript
// server/models/todo.js
const { Schema, model } = require('mongoose');

const todoSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    dueDate: { type: Date },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    tags: { type: [String], default: [] },
    // 将来の拡張: userId など
  },
  { timestamps: true }
);

module.exports = model('Todo', todoSchema);
```

**`routes/todos.js`**（CRUD ルート）
```javascript
// server/routes/todos.js
const express = require('express');
const Todo = require('../models/todo');
const router = express.Router();

// CREATE
router.post('/', async (req, res) => {
  try {
    const todo = await Todo.create(req.body);
    res.status(201).json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ (list)
router.get('/', async (_req, res) => {
  const todos = await Todo.find().sort({ createdAt: -1 });
  res.json(todos);
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const updated = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  const deleted = await Todo.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

module.exports = router;
```

---

### 4. `.env.example` と `.env` を用意
```bash
# server/.env.example
MONGODB_URI=mongodb://127.0.0.1:27017/todo_api
PORT=3000
```
`.env` は `.env.example` をコピーして値を設定します：
```bash
cp .env.example .env
```

---

### 5. `package.json` にスクリプトを追加
```json
// server/package.json の scripts 例
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon --quiet server.js",
    "lint": "eslint .",
    "format": "prettier -w ."
  }
}
```

---

### 6. ルートに README.md を作成（このドキュメントを反映）
リポジトリ直下（`todo-api/`）に **README.md** を作り、
このキャンバス上にある **日本語版/英語版の README セクション** をそのまま貼り付けます。

```bash
# ルートに戻る
cd ..

# エディタで README.md を作成/編集（例）
code README.md        # VS Code を使う場合
# あるいは
nano README.md
```

> 補足：README は **リポジトリ直下** に置くのが慣習です。`server/` に置く必要はありません。

---

### 7. `.gitignore` を設定（ルート）
```gitignore
# .gitignore (repo root)
node_modules/
.env
.env.*
coverage/
dist/
.DS_Store
**/node_modules/
```

---

### 8. 起動 & 動作確認
```bash
# server/ に移動して開発起動
cd server
npm run dev
```

別のターミナルから cURL 等で確認：
```bash
# ヘルスチェック
curl http://localhost:3000/

# 作成
curl -X POST http://localhost:3000/todos \
  -H 'Content-Type: application/json' \
  -d '{"title":"Write README","status":"in-progress"}'

# 一覧
curl http://localhost:3000/todos
```

---

### 9. GitHub へ初回コミット & プッシュ
```bash
# ルート（todo-api/）に戻る
cd ..

git add .
git commit -m "Initialize ToDo API with README and basic CRUD"

# GitHub CLI がある場合（公開リポジトリ作成例）
gh repo create todo-api --public --source=. --remote=origin --push

# CLI が無い場合（先に GitHub 上で空のリポジトリを作成してから）
# 例: https://github.com/your-username/todo-api
# その後：
# git remote add origin https://github.com/your-username/todo-api.git
# git branch -M main
# git push -u origin main
```

---

### 10. 次の一歩（おすすめ）
- ルートに `CONTRIBUTING.md` / `LICENSE` を追加
- リクエストバリデーション（`express-validator` など）
- エラーハンドリング用ミドルウェアの導入
- OpenAPI (Swagger) で API 仕様を書き、`/docs` で公開
- テスト（`vitest` or `jest`）と CI の追加

---

これで、README を含む初期プロジェクトの作成〜動作確認〜GitHub 公開までを通せます。  
必要なら上記のコードをベースに、認証やカレンダー連携の設計も追記します。

---

---

## API Quick Reference / 使い方

### Health Check
```bash
curl http://localhost:3000/
# => {"ok":true,"message":"Server is running 🚀"}

### Create ToDo

```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Write README","status":"in-progress"}'

### List ToDos

```bash
curl http://localhost:3000/todos

### Update ToDo

```bash
curl -X PUT http://localhost:3000/todos/<_id> \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

### Delete ToDo

```bash
curl -i -X DELETE http://localhost:3000/todos/<_id>

### Validation Example

title が無い場合はエラーを返します。

```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"status":"pending"}'

結果:

```bash
{"error":"Validation error","details":[...]}

### Setup / 開発手順

```bash
# 1) clone
git clone <your-repo-url>
cd todo-api

# 2) 環境変数を準備
cp server/.env.example server/.env

# 3) サーバー起動
cd server
npm install
npm run dev


