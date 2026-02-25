# 🗂️ Todo API (Node.js + Express + MongoDB) ![CI](https://github.com/PWuttam/todo-api/actions/workflows/ci.yml/badge.svg)

A **minimal, production-ready REST API** for managing todo items — built with **Express** and **Mongoose**, following clean and extensible architecture principles.

This project serves as a foundation for building robust backend APIs with a clear structure, validation, and roadmap toward production quality.

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Usage](#-usage)
- [Makefile Commands](#-makefile-commands)
- [Tech Stack](#-tech-stack)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Development Scripts](#-development-scripts)
- [Error Handling](#-error-handling)
- [Roadmap / Improvements](#-roadmap--improvements)
- [Docs](#-docs)
- [License](#-license)
- [Contributing](#-contributing)

---

## 🚀 Quick Start

### 1️⃣ Install dependencies

```bash
npm install
```

### 2️⃣ Configure environment variables

```bash
cp .env.example .env
```

✅ .env.example reflects the latest required variables.

### 3️⃣ Start development server

```bash
npm run dev
```

Default URL:
➡️ http://localhost:3001

Health check：

```bash
curl -s http://localhost:3001/health | jq .
```

## 🐳 Run with Docker (API + MongoDB)

You can run the entire backend stack (Node.js API + MongoDB) using Docker.

This is the recommended setup for local development because it isolates the environment and requires no local MongoDB installation.

### 1️⃣ Start services

```bash
docker compose up -d
```

This will launch:
• api (Node.js Express server)
• mongo (MongoDB database)

### 2️⃣ Check if the API is running

```bash
curl http://localhost:3001/health
```

Expected response:

```bash
{ "ok": true }
```

### 3️⃣ Try the API using curl

`/todos` and `/boards` endpoints require a Bearer access token.

```bash
export ACCESS_TOKEN="<accessToken>"
```

Create a todo

```bash
curl -X POST http://localhost:3001/todos \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Docker todo","status":"pending"}'
```

Get all todos

```bash
curl http://localhost:3001/todos \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Update a todo

```bash
curl -X PUT http://localhost:3001/todos/<id> \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated","status":"completed"}'
```

Delete a todo

```bash
curl -X DELETE http://localhost:3001/todos/<id> \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### 4️⃣ Stop containers

```bash
docker compose down
```

### 🔁 Automatic Restart (Docker)

Both the API and MongoDB containers use Docker’s restart policy:

```yaml
restart: unless-stopped
```

This means:

	•	If a container crashes, it will automatically restart.
	•	If you manually stop the services using:
  
```bash
  docker compose stop
```

…they will stay stopped until you manually start them again.

This makes the development environment more stable and resilient.


### 5️⃣ Environment variables

Docker development uses .env.docker.
To customize:

```bash
cp .env.docker .env
```

## 📦 Usage

Run the Docker-based stack from the repository root with Docker Compose.

## 🛠️ Makefile Commands

Use these shortcuts from the repository root:
- `make up` — start the stack in detached mode.
- `make down` — stop and remove the stack.
- `make logs` — follow combined service logs.
- `make restart` — recreate the stack by stopping then starting.
- `make seed` — run `npm run seed` inside the `api` service.
- `make smoke` — run the smoke test inside the `api` service.

Smoke test (Docker required, containers already running):

```bash
make smoke
```

Equivalent command:

```bash
docker compose exec api ./scripts/smoke.sh
```

## 🧰 Tech Stack

| Layer          | Technology                |
| -------------- | ------------------------- |
| Runtime        | Node.js (18+)             |
| Framework      | Express                   |
| Database       | MongoDB + Mongoose        |
| Validation     | express-validator         |
| Config         | dotenv                    |
| Error Handling | Custom middleware         |
| Dev Tools      | Nodemon, ESLint, Prettier |
| Testing        | node:test + Supertest     |

ℹ️ CI is configured with GitHub Actions (`.github/workflows/ci.yml`) for smoke checks.

## 🔑 Environment Variables

### Local execution (`.env`)

Create a .env file based on .env.example for running `npm run dev` / `npm start` on the host:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/todo_api
PORT=3001
NODE_ENV=development
JWT_SECRET=change-me
# Optional (falls back to JWT_SECRET if omitted)
JWT_REFRESH_SECRET=change-me
```

### Docker execution (`.env.docker`)

- Purpose: Docker-specific env file applied via `docker-compose` `env_file: .env.docker` so containers get the right settings.
- Differences: `.env` is for host runs, `.env.docker` is for Docker runs, `.env.example` is the template for both.
- Priority: `docker compose run ... -e KEY=VAL` > `.env.docker` > app defaults.
- Avoid mixing: use `.env` for host-only runs and `.env.docker` for container runs. After editing `.env.docker`, restart the stack:

```bash
docker compose down
docker compose up -d
```

## 📡 API Reference

Base URL: http://localhost:3001

Auth note: `/todos`, `/boards`, and `/me` require `Authorization: Bearer <accessToken>`.

| Method | Path | Description | Body (JSON) |
| :----- | :--- | :---------- | :---------- |
| GET | `/health` | Health check | — |
| GET | `/me` | Get authenticated user profile | — |
| GET | `/boards` | List boards | — |
| GET | `/todos` | List all todos | — |
| GET | `/boards/:boardId/todos` | List todos in a board | — |
| POST | `/todos` | Create a todo | `{ "title": "string", "description": "?", "status": "pending | in-progress | completed", "tags": ["?"] }` |
| PUT | `/todos/:id` | Update a todo | same as POST |
| DELETE | `/todos/:id` | Delete a todo | — |
| POST | `/auth/refresh` | Rotate refresh token | `{ "refreshToken": "string" }` |
| POST | `/auth/logout` | Revoke refresh token | `{ "refreshToken": "string" }` |

✅ Validation handled via express-validator in route definitions.

### Example

```bash
curl -X POST http://localhost:3001/todos \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{ "title": "Write README", "status": "pending" }'
```

### Optional query filters

```bash
curl "http://localhost:3001/todos?status=pending&tag=work,urgent&q=readme&sort=dueDate:asc&page=1&limit=10" \
  -H "Authorization: Bearer <accessToken>"
```

### Board-scoped todos (NexusBoard integration)

Boards are treated as the primary resource for board-specific lists. The canonical endpoint is:

```bash
curl http://localhost:3001/boards/<boardId>/todos \
  -H "Authorization: Bearer <accessToken>"
```

For backward compatibility, `GET /todos?boardId=<id>` returns the same result. Both endpoints respond with:

```json
{ "todos": [...] }
```

### Refresh token reuse detection (#77)

When a rotated/revoked refresh token is replayed, `/auth/refresh` returns `403` with `errorCode: "REFRESH_TOKEN_REUSE"`.
See: [docs/auth-refresh-token-reuse.md](./docs/auth-refresh-token-reuse.md)

## 🗂️ Project Structure

```bash
todo-api/
├── README.md                  # Main English README
├── README.ja.md               # Japanese translation (localized)
│
├── data/
│   └── seed.todos.json        # Sample todo dataset for seeding
│
├── docs/
│   ├── dev-notes.md           # Developer notes
│   ├── pm-brief.md            # PM summary (project overview)
│   ├── learning/              # Space for study-related materials
│   └── todo-api-flow-with-improvements.png   # Architecture diagram
│
├── middlewares/
│   └── error.js               # Global error handler (outside server/)
│
├── routes/
│   └── userRoutes.js          # Example route (non-todo endpoints)
│
├── scripts/
│   ├── seed.js                # Initialize database with seed data
│   └── smoke.sh               # Quick end-to-end smoke test
│
├── server/
│   ├── config/                # MongoDB & environment config
│   ├── controllers/           # Controller layer
│   ├── middlewares/           # Express middlewares (API-specific)
│   ├── models/                # Mongoose models
│   ├── routes/                # /todos CRUD routes
│   ├── services/              # Business logic layer
│   ├── server.js              # API entry point
│   ├── package.json
│   └── package-lock.json
│
├── src/
│   ├── arrays.ts
│   ├── objects.ts
│   ├── variables.ts
│   ├── hello.ts
│   ├── functions/             # TypeScript practice files
│   └── classes/
│
├── utils/
│   └── asyncHandler.js        # Async/await wrapper for routes
│
├── eslint.config.js           # ESLint Flat Config
├── tsconfig.json              # TypeScript compiler settings
├── setup-labels.sh            # GitHub Issues label setup script
├── package.json               # Root package config
├── package-lock.json
└── node_modules/              # Installed dependencies
```

## 🧪 Development Scripts

From the repository root:

```bash
npm run dev     # start server with nodemon
npm start       # start normally (production-like)
npm run lint    # run ESLint + Prettier checks
npm test        # run node:test suites
```

Targeted test execution:

```bash
node --test tests/todos.test.js
node --test tests/auth.test.js
```

### Migration script (#77)

```bash
npm run migrate:token-reuse-77
```

### Seed sample data (Docker)

```bash
make seed
```

## ⚠️ Error Handling

All errors are normalized through middlewares/error.js.

- Stack traces visible only in non-production mode.
- Future improvement: unify async route handling with a global wrapper.
- 400/404/500 responses are structured for frontend consumption.

## 🧭 Roadmap / Improvements

Done:
- ✅ node:test + Supertest test suites
- ✅ Security middlewares (morgan, helmet, CORS, rate limiting)
- ✅ GitHub Actions smoke CI

Next:
- ⚙️ Add async route wrapper for clean error flow
- 📘 Integrate Swagger/OpenAPI at /docs
- 🔧 Introduce config loader by environment
- 🚀 Expand CI to run smoke + full tests

## 📘 Docs

- 🧑‍💻 Developer Notes
- 🗂 PM Brief
- 🧩 Architecture Diagram
- 🤝 Contributing

Pull requests are welcome!
If you’d like to suggest improvements or report issues, please open an issue or a pull request.

## 📄 License

Released under the MIT License.
See LICENSE for details.

## 📘 Resources

- [🇯🇵 Japanese README](./README.ja.md)
- [📖 Codebase Overview](./docs/codebase-overview.md) - Complete guide for developers and AI assistants
- [🔐 Refresh Token Reuse Detection](./docs/auth-refresh-token-reuse.md)
- [Developer Notes](./docs/dev-notes.md)
- [PM Brief](./docs/pm-brief.md)
- [Architecture Diagram](./docs/todo-api-flow-with-improvements.png)

## 🪄 Quick Commit Workflow

```bash
# Create a new branch
git checkout -b docs/refresh-readme

# Edit and save
nano README.md

# Commit and push
git add README.md
git commit -m "docs: refresh README (add clarity and transparency notes)"
git push origin docs/refresh-readme
```

## ✅ Notes

- CI smoke workflow is configured (`.github/workflows/ci.yml`)
- `npm test` runs `node --test`
- Refresh token reuse behavior is documented in `docs/auth-refresh-token-reuse.md`
- Topics: consider adding
- nodejs, express, mongodb, mongoose, rest-api, backend, portfolio, javascript
- under repository About → Edit Topics
- Footer cleaned up for better readability
