# Learn TypeScript: Basics（2025-10-20）

## 🎯 今日のゴール

- [x] TypeScript の開発環境を整える
- [x] tsconfig.json を安全に設定
- [x] 3 つの基本（型・オブジェクト・配列）を理解
- [x] 1 つの .ts ファイルを実際に動かす

---

## 🧩 実施内容

1. `npm install --save-dev typescript @types/node`
2. `npx tsc --init` で `tsconfig.json` を作成
   - `"allowJs": true`, `"checkJs": false` に設定して安全導入
3. `src/hello.ts` を作成し、`npx ts-node src/hello.ts` で実行確認
4. `variables.ts` で型の基本（number / string / object / array）を練習

---

## 🧠 学び

- JavaScript と TypeScript は共存できる
- 型指定によりエラーを事前に防げる
- tsconfig の設定次第で柔軟に段階導入できる

---

## 🔜 明日のテーマ

**Learn TypeScript: Functions & Classes**  
→ ToDo フロント部分に TypeScript を導入し、`TodoService` クラスで型安全な処理に挑戦予定。

---

⏱ 実施日: 2025-10-20  
📁 プロジェクト: `todo-api`  
🏷 タグ: `typescript`, `learning`, `v0.6 — Modernization & Docs`
