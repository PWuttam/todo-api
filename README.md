✅ Paste-ready README (English)

# Todo API (Node.js + Express + MongoDB)

A minimal, well-structured REST API for todo items. Built with **Express** and **Mongoose**, with room to grow (tests, CI, docs).  
This README focuses on **quick setup**, **clear API usage**, and **next steps for production**.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Development Scripts](#development-scripts)
- [Error Handling](#error-handling)
- [Roadmap / Improvements](#roadmap--improvements)
- [Docs](#docs)
- [License](#license)

---

## Quick Start

```bash
# 1) Install deps
cd server
npm install

# 2) set env (see .env.example)
cp .env.example .env

# 3) run dev server (nodemon)
npm run dev

# default: http://localhost:3000
```

### Health check:

```bash
curl -s http://localhost:3000/todos | jq .
```

---

## Environment Variables

### Create a .env file based on .env.example:

```ini
MONGODB_URI=mongodb://localhost:27017/todo-api
PORT=3000
NODE_ENV=development
```

---

## API Reference

### Base URL: http://localhost:3000

### Todos

| Method | Path         | Description       | Body (JSON)                                                                 |
|--------|--------------|-------------------|-----------------------------------------------------------------------------|
| GET    | `/todos`     | List todos        | —                                                                           |
| POST   | `/todos`     | Create a todo     | `{ "title": "string", "description": "?", "dueDate": "ISO", "status": "todo \| doing \| done", "tags": ["?"] }` |
| GET    | `/todos/:id` | Get by id         | —                                                                           |
| PUT    | `/todos/:id` | Update all fields | same as POST                                                                |
| DELETE | `/todos/:id` | Delete by id      | —                                                                           |

> Validation is handled by **express-validator** in routes.


### Example

```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{ "title":"Write README", "status":"todo" }'
```

---

## Project Structure

```text
server/
├─ server.js               # App entry
├─ config/
│  └─ db.js                # Mongoose connection
├─ routes/
│  └─ todos.js             # /todos CRUD + validation
├─ models/
│  └─ todo.js              # Mongoose schema
├─ middlewares/
│  └─ error.js             # Global error handler
└─ package.json
scripts/
└─ smoke.sh                # quick end-to-end smoke test
docs/
├─ dev-notes.md
├─ pm-brief.md
└─ todo-api-flow-with-improvements.png   # architecture diagram
```

---

## Development Scripts

### From server/:

```bash
npm run dev        # start with nodemon
npm start          # start (production-like)
npm test           # (placeholder)
```

### Smoke test

```bash
bash ../scripts/smoke.sh
```

---

## Error Handling

All errors are normalized by middlewares/error.js.

- Non-production shows stack traces for easier debugging.

- Consider adding an async wrapper to unify async/await error flows.

---

## Roadmap / Improvements

- 🧪 Automated tests: Jest + Supertest for CRUD and regressions
- 📝 Linting/Formatting: ESLint + Prettier (CI enforced)
- ⚠️ Error wrapper for async routes
- 📘 API Docs: Swagger/OpenAPI (serve at /docs)
- 🔍 Logging: morgan (HTTP) + winston (app)
- 🛡 Security: helmet, rate limits, CORS policy
- ⚙️ Config: environment-based configuration loader
- CI: run tests + scripts/smoke.sh on PR via GitHub Actions

---

## Docs

- Developer Notes — [docs/dev-notes.md](docs/dev-notes.md)
- PM Brief — [docs/pm-brief.md](docs/pm-brief.md)
- Architecture Diagram — [docs/todo-api-flow-with-improvements.png](docs/todo-api-flow-with-improvements.png)

---

## License

### MIT

````yaml

### ターミナルで置き換える手順

```bash
# 1) ブランチを切る（推奨）
git checkout -b docs/refresh-readme

# 2) READMEを開く（nano 例）
nano README.md
# → 既存内容を全選択で消して、上のMarkdownをペースト
# 保存: Ctrl+O, Enter / 終了: Ctrl+X

# 3) 変更を確認してコミット
git add README.md
git commit -m "docs: refresh README (clear quickstart, API table, diagram)"

# 4) プッシュ＆PR
git push origin docs/refresh-readme
# （GitHubでPRを作ってMerge）

````

すぐ main に入れたい場合はブランチなしで
git add README.md && git commit -m "docs: refresh README" && git push origin main
でも OK。
