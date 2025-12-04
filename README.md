# 🗂️ Todo API (Node.js + Express + MongoDB)

A **minimal, production-ready REST API** for managing todo items — built with **Express** and **Mongoose**, following clean and extensible architecture principles.

This project serves as a foundation for building robust backend APIs with a clear structure, validation, and roadmap toward production quality.

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
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
cd server
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
➡️ http://localhost:3000

Health check：

```bash
curl -s http://localhost:3000/todos | jq .
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
curl http://localhost:3000/health
```

Expected response:

```bash
{ "ok": true }
```

### 3️⃣ Try the API using curl

Create a todo

```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Docker todo","completed":false}'
```

Get all todos

```bash
curl http://localhost:3000/todos
```

Update a todo

```bash
curl -X PUT http://localhost:3000/todos/<id> \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated","status":"completed"}'
```

Delete a todo

```bash
curl -X DELETE http://localhost:3000/todos/<id>
```

### 4️⃣ Stop containers

```bash
docker compose down
```

### 5️⃣ Environment variables

Docker development uses .env.docker.
To customize:

```bash
cp .env.docker .env
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
| Testing        | Jest (planned)            |

ℹ️ Continuous Integration (CI) via GitHub Actions is not yet configured.
It will be added as part of roadmap milestone “v0.3 – CI & Testing”.

## 🔑 Environment Variables

Create a .env file based on .env.example:

```bash
MONGODB_URI=mongodb://localhost:27017/todo-api
PORT=3000
NODE_ENV=development
```

## 📡 API Reference

Base URL: http://localhost:3000

| Method | Path         | Description      | Body (JSON)                                               |       |                         |
| :----- | :----------- | :--------------- | :-------------------------------------------------------- | ----- | ----------------------- |
| GET    | `/todos`     | List all todos   | —                                                         |       |                         |
| POST   | `/todos`     | Create a todo    | `{ "title": "string", "description": "?", "status": "todo | doing | done", "tags": ["?"] }` |
| GET    | `/todos/:id` | Get a todo by ID | —                                                         |       |                         |
| PUT    | `/todos/:id` | Update a todo    | same as POST                                              |       |                         |
| DELETE | `/todos/:id` | Delete a todo    | —                                                         |       |                         |

✅ Validation handled via express-validator in route definitions.

### Example

```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{ "title": "Write README", "status": "todo" }'
```

### Optional query filters

```bash
curl "http://localhost:3000/todos?status=pending&tag=work,urgent&q=readme&sort=dueDate:asc&page=1&limit=10"
```

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

From the server/ directory:

```bash
npm run dev     # start server with nodemon
npm start       # start normally (production-like)
npm test        # placeholder — testing framework (Jest) not yet implemented
```

### Seed sample data

For testing with mock data:

```bash
cd server
npm run seed:reset                 # reset to fixed 10 records
npm run seed:gen -- --count 40     # generate up to 40 random records
```

## ⚠️ Error Handling

All errors are normalized through middlewares/error.js.

- Stack traces visible only in non-production mode.
- Future improvement: unify async route handling with a global wrapper.
- 400/404/500 responses are structured for frontend consumption.

## 🧭 Roadmap / Improvements

- 🧪 Add automated tests (Jest + Supertest)
- 🧹 Enforce ESLint + Prettier in CI
- ⚙️ Add async route wrapper for clean error flow
- 📘 Integrate Swagger/OpenAPI at /docs
- 🔍 Add morgan (HTTP logs) + winston (app logs)
- 🛡 Add helmet, CORS rules, rate limiting
- 🔧 Introduce config loader by environment
- 🚀 CI/CD: run smoke + test via GitHub Actions

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

- CI not yet configured — transparency added
- npm test clearly marked as placeholder
- .env.example alignment verified
- Topics: consider adding
- nodejs, express, mongodb, mongoose, rest-api, backend, portfolio, javascript
- under repository About → Edit Topics
- Footer cleaned up for better readability
