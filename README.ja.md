# 🗂️ Todo API（Node.js + Express + MongoDB） ![CI](https://github.com/PWuttam/todo-api/actions/workflows/ci.yml/badge.svg)

**Express** と **Mongoose** を使用して構築された、シンプルかつ拡張性のある **ToDo管理用REST API** です。  
明確なアーキテクチャ、バリデーション、エラーハンドリングを備え、  
本番運用を見据えた堅牢なバックエンドAPI構築のベースとして設計されています。

---

## 📋 目次

- [クイックスタート](#-クイックスタート)
- [使い方](#-使い方)
- [Makefile コマンド](#-makefile-コマンド)
- [使用技術（Tech Stack）](#-使用技術tech-stack)
- [環境変数](#-環境変数)
- [APIリファレンス](#-apiリファレンス)
- [プロジェクト構成](#-プロジェクト構成)
- [開発用スクリプト](#-開発用スクリプト)
- [エラーハンドリング](#-エラーハンドリング)
- [ロードマップ / 改善予定](#-ロードマップ--改善予定)
- [ドキュメント](#-ドキュメント)
- [ライセンス](#-ライセンス)
- [コントリビューション（貢献）](#-コントリビューション貢献)

---

## 🚀 クイックスタート

### 1️⃣ 依存パッケージをインストール

```bash
cd server
npm install
```

## 2️⃣ 環境変数ファイルを設定

```bash
cp .env.example .env
```

✅ .env.example は最新の環境変数構成を反映済みです。

## 3️⃣ 開発サーバーを起動

```bash
npm run dev
```

デフォルトURL：
➡️ http://localhost:3000

### 動作確認（ヘルスチェック）：

```bash
curl -s http://localhost:3000/todos | jq .
```

## 🐳 Docker を使った起動方法（API + MongoDB）

Node.js API と MongoDB を Docker 上でまとめて動かせます。  
ローカルに MongoDB をインストールする必要がなく、**最も簡単で安定した開発環境**です。

---

### 1️⃣ コンテナを起動する

```bash
docker compose up -d
```

起動するサービス：
• api（Node.js / Express）
• mongo（MongoDB）

### 2️⃣ API が正常に動作しているか確認

```bash
curl http://localhost:3000/health
```

期待されるレスポンス：

```bash
{ "ok": true }
```

### 3️⃣ curl を使って ToDo API を操作する

📝 ToDo を作成

```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Docker todo","completed":false}'
```

📄 ToDo 一覧を取得

```bash
curl http://localhost:3000/todos
```

✏️ ToDo を更新

```bash
curl -X PUT http://localhost:3000/todos/<id> \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated","status":"completed"}'
```

🗑️ ToDo を削除

```bash
curl -X DELETE http://localhost:3000/todos/<id>
```

### 4️⃣ コンテナを停止する

```bash
docker compose down
```

### 🔁 自動リスタート（Docker）

API と MongoDB のコンテナには、Docker の「再起動ポリシー」が設定されています：

```bash
restart: unless-stopped
```

この設定の意味は次のとおりです：

	•	コンテナが クラッシュ（異常終了）した場合は、自動で再起動します
	•	一方、以下のように 手動で停止した場合 は再起動しません：
  
```bash
docker compose stop
```

つまり、「落ちたら自動復旧、手動停止は尊重」という、扱いやすい挙動になります。
ローカル開発環境がより安定し、トラブルに強くなります。

5️⃣ Docker 用の環境変数ファイル

Docker 開発用には .env.docker を使用します。

カスタマイズしたい場合：

```bash
cp .env.docker .env
```


## 📦 使い方

リポジトリ直下で Docker Compose を使ってスタックを動かしてください。

## 🛠️ Makefile コマンド

すべてリポジトリ直下で実行します：
- `make up` — スタックをバックグラウンドで起動
- `make down` — コンテナを停止して削除
- `make logs` — すべてのサービスのログを追跡
- `make restart` — 一度停止してから再起動
- `make seed` — `api` サービス内で `npm run seed` を実行

---

## 🧰 使用技術（Tech Stack）

| レイヤー           | 使用技術                  |
| :----------------- | :------------------------ |
| 実行環境           | Node.js (18+)             |
| フレームワーク     | Express                   |
| データベース       | MongoDB + Mongoose        |
| バリデーション     | express-validator         |
| 設定管理           | dotenv                    |
| エラーハンドリング | カスタムミドルウェア      |
| 開発支援           | Nodemon, ESLint, Prettier |
| テスト             | Jest（予定）              |

ℹ️ GitHub Actions を用いた継続的インテグレーション（CI）は まだ設定されていません。
今後のマイルストーン「v0.3 – CI & Testing」で導入予定です。

## 🔑 環境変数

### ローカル実行時（`.env`）

.env.example を参考に .env ファイルを作成し、ホストで `npm run dev` / `npm start` するときに使います：

```bash
MONGODB_URI=mongodb://localhost:27017/todo-api
PORT=3000
NODE_ENV=development
```

### Docker 実行時（`.env.docker`）

- 目的: Docker 専用の環境変数ファイル（`docker-compose` の `env_file: .env.docker` でコンテナに適用）
- 違い: `.env` はホスト実行用、`.env.docker` は Docker 用、`.env.example` は両方のひな型
- 優先度: 実行時の `docker compose run ... -e KEY=VAL` > `.env.docker` > アプリのデフォルト値
- 混同防止: ホストは `.env`、コンテナは `.env.docker` を使い分ける。編集後は必ず再起動する：

```bash
docker compose down
docker compose up -d
```

## 📡 APIリファレンス

Base URL: http://localhost:3000

| メソッド | パス | 説明 | Body (JSON) |
| :----- | :--- | :--- | :---------- |
| GET | `/todos` | Todo一覧を取得 | — |
| GET | `/boards/:boardId/todos` | Board別のTodo一覧を取得 | — |
| POST | `/todos` | Todoを作成 | `{ "title": "string", "description": "?", "status": "todo | doing | done", "tags": ["?"] }` |
| GET | `/todos/:id` | IDを指定してTodoを取得 | — |
| PUT | `/todos/:id` | Todoを更新 | POSTと同じ |
| DELETE | `/todos/:id` | Todoを削除 | — |

✅ バリデーションは express-validator によりルート定義時に実行されます。

### 作成例

```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{ "title": "READMEを書く", "status": "todo" }'
```

### フィルター付き取得例

```bash
curl "http://localhost:3000/todos?status=pending&tag=work,urgent&q=readme&sort=dueDate:asc&page=1&limit=10"
```

### Board別のTodo取得（NexusBoard連携）

NexusBoardでは、Boardを単位としてTodoの一覧を扱います。
そのため、Boardを主軸とした一覧取得用のエンドポイントを正規（canonical）として定義しています。

```bash
curl http://localhost:3000/boards/<boardId>/todos
```

後方互換性を保つため、GET /todos?boardId=<id> も同じ結果を返します。
どちらのエンドポイントも、以下の形式でレスポンスを返します。

```json
{ "todos": [...] }
```

## 🗂️ プロジェクト構成

```bash
todo-api/
├── README.md                  # 英語版README
├── README.ja.md               # 日本語版README（このファイル）
│
├── data/
│   └── seed.todos.json        # サンプルToDoデータ
│
├── docs/
│   ├── dev-notes.md           # 開発メモ
│   ├── pm-brief.md            # PM向け概要資料
│   ├── learning/              # 学習関連ドキュメント置き場
│   └── todo-api-flow-with-improvements.png   # アーキテクチャ図
│
├── middlewares/
│   └── error.js               # グローバルエラーハンドラ
│
├── routes/
│   └── userRoutes.js          # /users系ルート
│
├── scripts/
│   ├── seed.js                # データベース初期化スクリプト
│   └── smoke.sh               # 簡易E2Eスモークテスト
│
├── server/
│   ├── config/                # DB設定
│   ├── controllers/           # コントローラ層
│   ├── middlewares/           # API専用ミドルウェア
│   ├── models/                # Mongooseモデル
│   ├── routes/                # /todos ルート
│   ├── services/              # ビジネスロジック層
│   ├── server.js              # APIエントリーポイント
│   ├── package.json
│   └── package-lock.json
│
├── src/
│   ├── arrays.ts
│   ├── objects.ts
│   ├── variables.ts
│   ├── hello.ts
│   ├── functions/             # TypeScript練習用コード
│   └── classes/
│
├── utils/
│   └── asyncHandler.js        # 非同期処理ラッパー
│
├── eslint.config.js           # ESLint設定
├── tsconfig.json              # TypeScript設定
├── setup-labels.sh            # GitHubラベル設定スクリプト
├── package.json
├── package-lock.json
└── node_modules/
```

## 🧪 開発用スクリプト

server/ ディレクトリで実行します：

```bash
npm run dev     # nodemonで開発モード起動
npm start       # 通常起動（本番想定）
npm test        # placeholder — Jestテストは未実装です
```

### サンプルデータ生成

開発中にダミーデータを投入するには：

```bash
cd server
npm run seed:reset                 # 固定10件にリセット
npm run seed:gen -- --count 40     # ランダムデータを最大40件まで追加
```

## ⚠️ エラーハンドリング

すべてのエラーは middlewares/error.js で一元管理されます。

- 本番環境以外ではスタックトレースを出力
- 非同期ルートの統一的エラーハンドリングは今後追加予定
- 400 / 404 / 500 応答は整形済みで、フロント側で扱いやすい形式

## 🧭 ロードマップ / 改善予定

- 🧪 Jest + Supertest による自動テスト追加
- 🧹 ESLint + Prettier のCI自動チェック
- ⚙️ 非同期ルート用エラーハンドラ追加
- 📘 Swagger / OpenAPI ドキュメントを /docs で提供
- 🔍 morgan（HTTPログ）+ winston（アプリログ）導入
- 🛡 helmet / CORS / Rate Limit によるセキュリティ強化
- 🔧 環境別設定ローダーの導入
- 🚀 GitHub Actions による自動テスト・スモークテスト実行

## 📘 ドキュメント

- 🧑‍💻 [開発者ノート](./docs/dev-notes.md)
- 🗂 [PM向け概要資料](./docs/pm-brief.md)
- 🧩 [アーキテクチャ図](./docs/todo-api-flow-with-improvements.png)

## 🤝 コントリビューション（貢献）

Pull Request は歓迎です！
改善提案・バグ報告は Issuesページ からどうぞ。

## 📄 ライセンス

本プロジェクトは MITライセンス で公開されています。
詳細は LICENSE をご覧ください。

## 📘 関連リソース

- [🇬🇧 English README](./README.md)
- [開発者ノート](./docs/dev-notes.md)
- [PM向け概要資料](./docs/pm-brief.md)
- [アーキテクチャ図](./docs/todo-api-flow-with-improvements.png)
