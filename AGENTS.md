# Repository Guidelines

## Project Structure & Module Organization
- `server/` houses the Express API: `app.js` for app wiring, `server.js` for boot, and subfolders for `controllers/`, `services/`, `models/`, `routes/`, and `middlewares/`.
- `tests/` contains API tests (e.g., `tests/todos.test.js`).
- `scripts/` holds utility scripts like `scripts/seed.js` and `scripts/smoke.sh`.
- `docs/` contains architecture and project notes.
- `data/` holds seed datasets.
- `src/` includes TypeScript practice files (not part of the API runtime).

## Build, Test, and Development Commands
From repo root:
- `npm run dev` — start the API with nodemon.
- `npm start` — start the API normally.
- `npm run lint` — run ESLint with Prettier checks.
- `npm test` — run Node’s built-in test runner.
- `make up` / `make down` — start or stop the Docker Compose stack.
- `make logs` — follow Docker logs.
- `make smoke` — run the end-to-end smoke test in the API container.

## Coding Style & Naming Conventions
- JavaScript is ESM (`"type": "module"`).
- Formatting is enforced by Prettier via ESLint (`eslint.config.js`). Prefer running `npm run lint` before PRs.
- File naming uses descriptive suffixes: `*.controller.js`, `*.service.js`, and route files like `server/routes/todos.js`.

## Testing Guidelines
- Tests live in `tests/` and use `node:test` with `supertest`.
- Naming pattern: `*.test.js` (example: `tests/todos.test.js`).
- Local test DB uses `MONGO_URI` or `MONGODB_URI`; ensure MongoDB is running.

## Commit & Pull Request Guidelines
- Commit messages follow a Conventional Commits style: `feat: ...`, `docs: ...`, `refactor(scope): ...`.
- PRs should include a short summary, test results (or rationale if not run), and link related issues when applicable.

## Security & Configuration Tips
- Use `.env.example` as the source of truth for required variables.
- For Docker, prefer `.env.docker` with `docker compose up -d`.
